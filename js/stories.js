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

function favoriteToggleHandler(evt) {
  let liElement = $(this).closest('li');
  //console.log("This: ", this);
  let liIndex = liElement.index();
   // console.log(liIndex);

  console.log("You favorited/unfavorited something");
  if(evt.target.classList.contains("far")) { //favoriting
    evt.target.classList.replace("far", "fas");
   
   currentUser.addFavorite(storyList.stories[liIndex]);
  }
  else { //unfavoriting
    evt.target.classList.replace("fas", "far");
    console.log("index to remove: ", liIndex);
    currentUser.removeFavorite(storyList.stories[liIndex]);
  }

}

$allStoriesList.on("click", "li span i", favoriteToggleHandler);
$favStoriesList.on("click", "li span i", favoriteToggleHandler);

async function createNewStoryAndUpdatePage(evt) {
  evt.preventDefault();
  $submitForm.hide();
  let story = {title: $("#submit-title").val(),
               author: $("#submit-author").val(),
               url: $("#submit-url").val()};
  await storyList.addStory(currentUser, story);

  putStoriesOnPage();
}
$submitForm.on("submit", createNewStoryAndUpdatePage);
/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, starClass) {
  // console.debug("generateStoryMarkup", story);

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
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    let $story;
    if(currentUser != undefined && currentUser.favorites.indexOf(story) != -1) { //is a favorite
      console.log("Here is a favorite");
      $story = generateStoryMarkup(story, "fas");
    }
    else { //not a favorite
      $story = generateStoryMarkup(story, "far");
    }
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

function putFavStoriesOnPage() {
  console.debug("putFavStoriesOnPage");

  $favStoriesList.empty();
  for(let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story, "fas");
    $favStoriesList.append($story);
  }

}
