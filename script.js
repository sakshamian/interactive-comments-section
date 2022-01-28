// variables
let data, curUser;
let dataObj, CURRENTUSER, isReplyBoxOpen, isEditBoxOpen;

// global selectors
let contentArea = document.querySelector('.comments');
const commentInputArea = document.querySelector('.comment-input-area');


// Inital HTML data
let serverData = await fetch("./data.json");
let dataJSON = await serverData.text();
dataObj = JSON.parse(dataJSON);
curUser = dataObj.currentUser;
showInitialData(dataObj);

function showInitialData(data) {
    let comments = data.comments;
    for (let i of comments) {
      contentArea.insertAdjacentHTML("beforeend", getContentHTML(i, curUser.username));
    }
}

// poll votes functionality
document.addEventListener('click', (e) =>{
  const target = e.target;
  const commentBox = target.closest('.comment-box');

  let currentPollvotes = target.nextElementSibling || target.previousElementSibling;
  let toggleAction = target.dataset.toggle;

  if (!commentBox || !toggleAction || target.classList.contains("active")) return;

  let votedBtn = commentBox.querySelector(".active");

  if(votedBtn){
    votedBtn.classList.remove("active");
  }
  switch(toggleAction){
    case "upvote":
      currentPollvotes.textContent = +currentPollvotes.textContent + 1;
      break;
    case "downvote":
      currentPollvotes.textContent = +currentPollvotes.textContent - 1;
      break;
  }
  target.classList.add("active");
});

// comments submit 
commentInputArea.addEventListener('submit',(e)=>{
  e.preventDefault();
  let commentTextArea = commentInputArea.querySelector('textarea');
  let timeOfComment = Date.now();

  let commentData = {
    user: curUser,
    createdAt: timeOfComment,
    content: commentTextArea.value,
    score: 0,
    replies : [],
    id: 3
  };
  contentArea.insertAdjacentHTML('beforeend',getContentHTML(commentData, curUser.username));
  commentTextArea.value = "";
});

// adding replies and editing comments
document.addEventListener("click", (e)=>{
  const target = e.target;
  const commentBox = target.closest(".comment-box");

  if (!target.dataset.action && !commentBox) return;
  let action = target.dataset.action;

  // replies
  if(action == 'reply'){
    if (isReplyBoxOpen) {
      document.querySelector('.reply-input-area').remove();
      isReplyBoxOpen = false;
      return;
    }
  
    const relpyHTML = getReplyBoxHTML();
    commentBox.insertAdjacentHTML('afterend',relpyHTML);
  
    isReplyBoxOpen = true;
  
    // listening for adding reply event
    document.querySelector('.reply-input-area').addEventListener('submit',(e)=>{
      e.preventDefault();
      const replyBox = e.currentTarget;
      let reply = replyBox.querySelector('textarea').value;
      let replyingTo = commentBox.querySelector('.userName'); 
      let timeOfComment = Date.now();
      
      let commentData = {
        user: curUser,
        createdAt: timeOfComment,
        content: reply,
        score: 0,
        replyingTo : replyingTo.textContent,
        id: 3
      };
  
      let replyBoxHTML = getContentHTML(commentData,curUser.username);
      let repliesWrapper = document.createElement('div');
      repliesWrapper.className = 'replies-wrapper';
      repliesWrapper.innerHTML = replyBoxHTML;
      
      isReplyBoxOpen = false;
  
      // check if replying to a comment or adding a reply
      let alreadyOtherReplies = replyBox.nextElementSibling?.classList.contains("replies-wrapper"),
          replyingtoreply = replyBox.closest(".replies-wrapper");

        if (alreadyOtherReplies || replyingtoreply) {
          if (alreadyOtherReplies) {
            replyBox.nextElementSibling.insertAdjacentHTML("beforeend", replyBoxHTML);
          } else if (replyingtoreply) {
            replyBox.closest(".replies-wrapper").insertAdjacentHTML("beforeend", replyBoxHTML);
          }
          replyBox.remove();
          return;
        }
        replyBox.outerHTML = repliesWrapper.outerHTML;
    });
  }

  //edit functionality
  else if(action == 'edit'){
    if(isEditBoxOpen) return;

    let commentArea = commentBox.querySelector(".comment-text");
    let replyMention = commentArea.querySelector("span") || "";

      commentArea.innerHTML = `
        <div class="comment--update-area">
        <textarea placeholder="Update Comment..." required>${
          replyMention.nextSibling?.textContent || commentArea.innerText
        }</textarea>
        <input type="submit" value="UPDATE"
        class="submit-btn low-opacity-hover bold-txt"
        />
        </div>`;
      isEditBoxOpen = true;

      commentArea.querySelector('input[type="submit"]').addEventListener("click", function (e) {
        const TEXTAREA = commentArea.querySelector("textarea");
        let updatedComment = TEXTAREA.value;

        commentArea.innerHTML = (replyMention.outerHTML || "") + " " + updatedComment;

        isEditBoxOpen = false;
      });
  }

  else if(action == 'delete'){
    showModal(commentBox);
  }

});

function showModal(elemToDelete) {
  let wrapper = document.createElement("div");
  wrapper.className = "deleteModalWrapper";

  let modalHTML = `<div class="deleteModal">
  <h3 class="bold-txt">Delete comment</h3>
  <p>Are you sure you want to delete this comment? This will remove the comment and can't be undone.</p>
  <div class="modal-buttons">
    <button class="bold-txt" data-delete="false">No, cancel</button><button class="bold-txt" data-delete="true">Yes, Delete</button>
  </div>`;
  wrapper.innerHTML = modalHTML;
  document.body.append(wrapper);

  // button event listeners
  document.querySelector('[data-delete="true"]').addEventListener("click", () => {
    setTimeout(() => {
      elemToDelete.classList.add("remove");
      setTimeout(() => {
        elemToDelete.remove();
      }, 250);
    });
    wrapper.remove();
  });
  document.querySelector('[data-delete="false"]').addEventListener("click", () => {
    wrapper.remove();
  });
}

function getReplyBoxHTML() {
  return `<form class="comment-input-area reply-input-area ">
      <img src="images/avatars/image-juliusomo.png"
      alt="user_avatar"
      class="user_avatar" />
      <textarea placeholder="Reply..."></textarea>
      <input type="submit" value="REPLY" 
      class="submit-btn low-opacity-hover bold-txt" />
  </form>`;
}

function Get_Time(time) {
  const current = Date.now();
  let diff = (current - time);

  if (diff/ 1000 <= 60) {
    return 'now';
  }
  if (diff/ 1000 <= 3600) {
    return 'few minutes ago';
  }
  if (diff/ 1000<= 7200) {
    let result = Math.round( ((current- new Date(current - diff)) / 1000) / 3600)
    return result + (result == 1 ?  ' hour ago' :   ' hours ago');
  }
  if (diff/ 1000 <= 604800) {
    let result = Math.round(((current - new Date( current -  diff )) / 1000) / 86400)
    return result + (result == 1 ?  ' day ago': ' days ago');
  }
  if (diff / 1000<= 604800 * 3) {
    let result = Math.round(((Date.now() - new Date(Date.now() -  diff )) / 1000) / 86400 / 7)
    return result + ( result == 1 ?  ' week ago': ' weeks ago');
  }
  if (diff / 1000 <= 604800 * 10) {
    let result = Math.round((((current- new Date(current - diff)) / 1000) / 86400) / 28)
    return result + (result == 1 ?  ' month ago': ' months ago');
  }
  return "It's been so long since you left..";
}

// HTML content
function getContentHTML(comment = {}, currentuser) {
  let { user, createdAt, content, score, replyingTo = "", id } = comment;
  let ifThisIsCurrentUser = user.username == currentuser;

  let html = `<div class="comment-box ${replyingTo ? "reply" : ""} ${
    ifThisIsCurrentUser ? "currentuser" : ""
      }" data-id="${id}">
      <div class="poll-votes bold-txt">
      <div class="upvote-btn ${
        comment.toggle == "upvote" ? "active" : ""
      }" data-toggle="upvote">+</div>
      <div class="upvotes-num blue-clr-txt">${score}</div>
      <div class="downvote-btn ${
        comment.toggle == "downvote" ? "active" : ""
      }" data-toggle="downvote">-</div>
      </div>
      <div class="user-info">
        <img src="${user.image.webp}" alt="user_avatar" class="user_avatar"/>
        <div class="userName bold-txt">${user.username}</div>
        <div class="comment-time">${typeof createdAt == 'string' ? createdAt: Get_Time(createdAt)}</div>
      </div>
      <div class="action-area">
      ${
       ifThisIsCurrentUser
         ? `<div class ="delete-btn bold-txt red-clr-txt low-opacity-hover" tabindex="0" data-action="delete">Delete</div>
            <div class ="edit-btn bold-txt blue-clr-txt low-opacity-hover" tabindex="0" data-action="edit">Edit</div>`
         : `<div class="reply-btn bold-txt blue-clr-txt low-opacity-hover" tabindex="0" data-action="reply">Reply</div>`
     } 
    </div>
    <div class="comment-text">
     ${
       replyingTo ? ` <span class="bold-txt blue-clr-txt">${"@" + replyingTo}</span>` : ""
     } ${content}
    </div>
  </div>`;
     

  if (!comment.replies || !comment.replies.length) return html;

  // For replies
  let repliesWrapper = document.createElement("div");
  repliesWrapper.className = "replies-wrapper";

  // take commentobj, change it to html and add to previous result
  repliesWrapper.innerHTML = comment.replies.reduce((previousHTML, currentCommentObj) => {
    return previousHTML + getContentHTML({ ...currentCommentObj }, currentuser);
  }, "");
  return html + repliesWrapper.outerHTML;
}