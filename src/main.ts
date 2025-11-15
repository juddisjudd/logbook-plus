import { createApp } from "vue";
import App from "./App.vue";
import "./styles/base.css";

console.log("App initialization starting...");

const app = createApp(App);

app.config.errorHandler = (err, _instance, info) => {
  console.error("Vue error:", err, info);
};

app.config.warnHandler = (msg, _instance, trace) => {
  console.warn("Vue warning:", msg, trace);
};

window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled rejection:", event.reason);
});

console.log("Mounting app to #app...");
app.mount("#app");
console.log("App mounted successfully");
