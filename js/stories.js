"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * Add listener function to all star icons
 * function should get the story instance assc. with that li
 * add that story instance to favorites
 */
/**Function for either favoriting or unfavoriting a story */
function favoriteToggleHandler(evt) { //should change to finding story by ID
  let liElement = $(this).closest('li');
  let storyId = liElement.attr("id");

  if(evt.target.classList.contains("far")) { //favoriting
    evt.target.classList.replace("far", "fas");
   currentUser.addFavorite(storyId);
  }
  else { //unfavoriting
    evt.target.classList.replace("fas", "far");
      currentUser.removeFavorite(storyId);
  }

}
$allStoriesList.on("click", "li span i.fa-star", favoriteToggleHandler);
$favStoriesList.on("click", "li span i.fa-star", favoriteToggleHandler);
$myStoriesList.on("click", "li span i.fa-star", favoriteToggleHandler);

/**Called when user submits a new story. Updates page with new story */
async function createNewStoryAndUpdatePage(evt) {
  evt.preventDefault();
  $submitForm.hide();
  let story = {title: $("#submit-title").val(),
               author: $("#submit-author").val(),
               url: $("#submit-url").val()};
  await storyList.addStory(currentUser, story);

  $submitForm[0].reset();
  putStoriesOnPage();
}
$submitForm.on("submit", createNewStoryAndUpdatePage);

/**Helper function */
function findStoryUsingId(storyList, id) {
  for(let story of storyList.stories) {
    if (story.storyId == id) return story;
  }
  return undefined;
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 * - starClass: whether or not the star icon is filled or empty
 * Returns the markup for the story.
 */
function generateStoryMarkup(story, starClass) {
  console.debug("generateStoryMarkup", story);
  let trashIcon = "";
  let storyIndex;
  if(currentUser == undefined) {
    storyIndex = -1;
  }
  else { //check to see if the story is a user's own story
    storyIndex = currentUser.ownStories.findIndex(ownStory => ownStory.storyId == story.storyId);
  }
  if(storyIndex != -1) { //if so, add trash icon so there is the option to delete it
    trashIcon = '<i class="fa fa-trash"> </i>';
  }
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <span class="star">
          <i class="${starClass} fa-star"> </i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <span class="trash-can">${trashIcon}</span>
        <p class="story-author">by ${story.author}</p>
        <p class="story-user">posted by ${story.username}</p>
      </li>
      <hr>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();
  // loop through all of our stories and generate HTML for them
  console.log(currentUser)
  if(currentUser != undefined && currentUser.favorites.length != 0) {
    for (let story of storyList.stories) {
      let $story;
      let storyIndex = currentUser.favorites.findIndex(fStory => fStory.storyId == story.storyId);
      if(storyIndex != -1) { //is a favorite
        console.log("Here is a favorite");
        $story = generateStoryMarkup(story, "fas");
      }
      else { //not a favorite
        $story = generateStoryMarkup(story, "far");
      }
      $allStoriesList.append($story);
    }

  }
  else {
    for (let story of storyList.stories) {
      let $story = generateStoryMarkup(story, "far");
      $allStoriesList.append($story);
    }
  }
  
  $allStoriesList.show();
}



/** Gets list of stories from server, generates their HTML, and puts on page, while logged out. 
function putStoriesOnPageWhileLoggedOut() {
  console.debug("putStoriesOnPageWhileLoggedOut");

  $allStoriesList.empty();
  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    let $story;
    $story = generateStoryMarkup(story, "far");
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
*/

/**Puts a user's favorite stories on page when they click on the "favorites" button in navbar */
function putFavStoriesOnPage() {
  console.debug("putFavStoriesOnPage");

  $favStoriesList.empty();
  for(let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story, "fas");
    $favStoriesList.append($story);
  }

}

/**Puts a user's own stories on page when they click on the "my stories" button in navbar */
function putMyStoriesOnPage() {
  console.debug("putMyStoriesOnPage");

  $myStoriesList.empty();
  for(let story of currentUser.ownStories) {
    let $story;
    let storyIndex = currentUser.favorites.findIndex(fStory => fStory.storyId == story.storyId);
    if(currentUser != undefined && storyIndex != -1) { //is a favorite
      console.log("Here is a favorite");
      $story = generateStoryMarkup(story, "fas");
    }
    else { //not a favorite
      $story = generateStoryMarkup(story, "far");
    }
    $myStoriesList.append($story);
  }

}

/**Called when a user clicks the trash icon next to a story. Removes story locally and from API */
function removeStoryHandler(evt) {
  let liElement = $(this).closest('li');
  let storyId = liElement.attr("id");
  //console.log("StoryId:", storyId);
  storyList.removeStory(currentUser, storyId); //API call
  currentUser.removeStory(storyId); //local
  liElement.remove(); //DOM removal
}
$allStoriesList.on("click", "li span i.fa-trash", removeStoryHandler); //Can be removed from any of the 3 lists
$favStoriesList.on("click", "li span i.fa-trash", removeStoryHandler);
$myStoriesList.on("click", "li span i.fa-trash", removeStoryHandler);