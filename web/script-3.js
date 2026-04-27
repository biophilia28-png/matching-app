const bannedWords = [
  "카톡","카카오톡","오픈채팅","텔레그램","라인",
  "조건만남","스폰","원조","계좌","입금","전화번호","연락처"
];

function hasBannedWord(text){
  return bannedWords.some(w => text.includes(w));
}

function openChatFromDetail(){
  const name = document.getElementById("detailPartnerName").innerText;
  openChat(name);
}

function openChat(name){
  currentChatUser = name;
  document.getElementById("chatPartnerName").innerText = name;
  renderChat(name);
  saveChatRoom(name, "채팅방이 시작되었습니다.");
  goScreen("chat");
}

function sendMessage(){
  const input = document.getElementById("chatInput");
  const text = input.value.trim();

  if(!text) return;

  if(hasBannedWord(text)){
    alert("금지된 내용입니다.");
    input.value = "";
    return;
  }

  saveMessage(currentChatUser, text, true);
  saveChatRoom(currentChatUser, text);
  renderChat(currentChatUser);

  input.value = "";

  setTimeout(function(){
    const replies = [
      "대화 즐거워요 🙂",
      "궁합 좋네요!",
      "더 이야기해보고 싶어요",
      "좋은 인연이네요 😊"
    ];

    const reply = replies[Math.floor(Math.random() * replies.length)];

    saveMessage(currentChatUser, reply, false);
    saveChatRoom(currentChatUser, reply);
    renderChat(currentChatUser);
  }, 800);
}

function saveMessage(user, text, isMe){
  const key = "chat_" + user;
  const raw = localStorage.getItem(key) || "[]";
  const arr = JSON.parse(raw);

  arr.push({
    text: text,
    isMe: isMe,
    time: new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit"
    })
  });

  localStorage.setItem(key, JSON.stringify(arr));
}

function renderChat(user){
  const box = document.getElementById("chatMessages");
  const raw = localStorage.getItem("chat_" + user) || "[]";
  const messages = JSON.parse(raw);

  box.innerHTML = "";

  messages.forEach(function(m){
    const div = document.createElement("div");
    div.className = "chat-bubble " + (m.isMe ? "me" : "other");
    div.innerHTML = `
      ${m.text}
      <div class="chat-time">${m.time}</div>
    `;
    box.appendChild(div);
  });

  box.scrollTop = box.scrollHeight;
}

function saveChatRoom(user, lastMessage){
  let rooms = JSON.parse(localStorage.getItem("chatRooms") || "[]");

  rooms = rooms.filter(r => r.user !== user);

  rooms.unshift({
    user: user,
    lastMessage: lastMessage,
    time: new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit"
    })
  });

  localStorage.setItem("chatRooms", JSON.stringify(rooms));

  renderChatRooms();
  renderHomeRecentChat();
  renderHomeChatRoomList();
}
