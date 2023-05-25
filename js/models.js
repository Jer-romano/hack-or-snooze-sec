"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    let urlNoHTTP;
    if(this.url.indexOf("https") != -1) {
      urlNoHTTP = this.url.slice(8)
    }
    else urlNoHTTP = this.url.slice(7);

    if(urlNoHTTP.indexOf("/") == -1) return urlNoHTTP;
    else {
      return urlNoHTTP.slice(0, urlNoHTTP.indexOf("/"));
    }
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, newStory) {
    let response = await axios({
      url: `${BASE_URL}/stories`,
      method: "POST",
      data: {token: user.loginToken,
      story: {author: newStory.author,
              title: newStory.title,
              url: newStory.url,
            }}
    });
    const {story: {storyId, createdAt, title, author, url, username}} = response.data;
    let storyInstance = new Story({storyId, title, author, url, username, createdAt});
    this.stories.unshift(storyInstance); //adds story to beginning of list
    user.ownStories.push(storyInstance);
    return storyInstance;
  }

  /**Helper function */
  getStoryIndex(storyId) {
    for(let i = 0; i < this.stories.length; i++) {
      if(this.stories[i].storyId == storyId) {
        return i;
      }
    }
    return -1;
  }

  /**Makes API call to remove story. Also removes story from stories array */
  async removeStory(user, storyId) {
    let response = await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: {token: user.loginToken}
    });
    let sIndex = this.stories.findIndex(function(el) {
      return el.storyId == storyId;
    });
    this.stories.splice(sIndex, 1);
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = [] },
                token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  //if the request returns a user object, should the current user object be replaced with that one?
  async addFavorite(storyId) {
    const response = await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
      method: "POST",
      data: {token: this.loginToken} //should this be in a data object?
    });
    console.log("Response: ", response);
    //currentUser = response.data.user;
    this.favorites.push(findStoryUsingId(storyList, storyId)); //we don't need to create a new Story instance because it is being passed in
    //currentUser = response.data.user;
  }

  /** Helper function for getting a story's index in the favorites array*/
  getFavStoryIndex(storyId) {
    for(let i = 0; i < this.favorites.length; i++) {
      if(this.favorites[i].storyId == storyId) {
        return i;
      }
    }
    return undefined;

  }

  /**Removes a favorite from a user's favorites list */
  async removeFavorite(storyId) {
    const response = await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
      method: "DELETE",
      data: {token: this.loginToken} 
    });
    //console.log(response);
  
    let favIndex = this.getFavStoryIndex(storyId);
    if(favIndex == undefined) {
      console.log("STORY NOT FOUND");
    }
    else currentUser.favorites.splice(favIndex, 1); //remove story from favorites array
  }

  /** Removes a story from a user's ownStories array, as well as their favorites array, if applicable */
  removeStory(storyId) {
    let sIndex = this.ownStories.findIndex((el) => el.storyId == storyId);
    this.ownStories.splice(sIndex, 1);

    let favIndex = this.favorites.findIndex((el) => el.storyId == storyId);
    if( favIndex != -1) {
      this.favorites.splice(favIndex, 1);
    }
  }

  /** Login user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */
  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }
}
