"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}
$navLogin.on("click", navLoginClick);

/**Show submit story form on click on "submit" */
function navSubmitClick(evt) {
  console.debug("navSubmitClick", evt);
  hidePageComponents();
  $submitForm.show();
  putStoriesOnPage();

}
$navSubmit.on("click", navSubmitClick);

/** Show list of favorites on click on 'favorites' in nav bar */
function navFavoritesClick(evt) {
  console.debug("navFavoritesClick", evt);
  hidePageComponents();
  putFavStoriesOnPage();
  $favStoriesList.show();

  if(currentUser.favorites.length == 0) {
    $favStoriesList.append($("<h5>No favorites added!</h5>"));
  }

}
$navFavorites.on("click", navFavoritesClick);

function navMyStoriesClick(evt) {
  console.debug("navMyStoriesClick", evt);

  hidePageComponents();
  putMyStoriesOnPage();
  $myStoriesList.show();

  if(currentUser.ownStories.length == 0) {
    $myStoriesList.append($("<h5>You haven't added any stories!</h5>"));
  }
}
$navMyStories.on("click", navMyStoriesClick);

/** When a user first logins in, update the navbar to reflect that. */
function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
  $navSubmit.show();
  $navFavorites.show();
  $navMyStories.show();
  $navDividers.show();
}
