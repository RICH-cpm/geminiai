let chats = JSON.parse(localStorage.getItem("chats") || "[]");
let currentChat = {name: "Новый чат", messages: []};
renderChatList();

function renderChatList() {
  const chatList = document.getElementById("chatList");
  chatList.innerHTML = "";
  chats.forEach((c, i) => {
    let div = document.createElement("div");
    div.innerText = c.name;
    div.onclick = () => loadChat(i);
    chatList.appendChild(div);
  });
}
function loadChat(index) {
  currentChat = chats[index];
  const chat = document.getElementById("chat");
  chat.innerHTML = "";
  currentChat.messages.forEach(m => {
    let div = document.createElement("div");
    div.className = "msg " + m.role;
    div.innerHTML = marked.parse(m.text);
    chat.appendChild(div);
  });
  chat.scrollTop = chat.scrollHeight;
}
function saveChat() {
  localStorage.setItem("chats", JSON.stringify(chats));
  renderChatList();
}
function newChat() {
  currentChat = {name: "Новый чат", messages: []};
  chats.push(currentChat);
  saveChat();
  loadChat(chats.length - 1);
}
function clearChats() {
  if (confirm("Удалить все чаты?")) {
    chats = [];
    currentChat = {name: "Новый чат", messages: []};
    saveChat();
    renderChatList();
    document.getElementById("chat").innerHTML = "";
  }
}
function checkEnter(event) {
  if (event.key === "Enter") sendMessage();
}
async function sendMessage() {
  const msg = document.getElementById("message").value.trim();
  if (!msg) return;
  const chat = document.getElementById("chat");

  let userDiv = document.createElement("div");
  userDiv.className = "msg user";
  userDiv.innerText = msg;
  chat.appendChild(userDiv);
  chat.scrollTop = chat.scrollHeight;
  currentChat.messages.push({role: "user", text: msg});

  document.getElementById("message").value = "";

  // loader
  let typingDiv = document.createElement("div");
  typingDiv.className = "msg bot";
  typingDiv.innerHTML = `<div class="loader">
    <div class="dot"></div><div class="dot"></div><div class="dot"></div>
  </div>`;
  chat.appendChild(typingDiv);
  chat.scrollTop = chat.scrollHeight;

  let res = await fetch("http://127.0.0.1:5000/ask", {   // backend
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({question: msg})
  });
  let data = await res.json();

  chat.removeChild(typingDiv);

  let botDiv = document.createElement("div");
  botDiv.className = "msg bot";
  botDiv.innerHTML = marked.parse(data.answer);
  chat.appendChild(botDiv);
  chat.scrollTop = chat.scrollHeight;
  currentChat.messages.push({role: "bot", text: data.answer});
  saveChat();
}
function handleFile(event) {
  const file = event.target.files[0];
  if (file) alert("📎 Файл выбран: " + file.name);
}