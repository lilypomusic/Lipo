// basic smoke test so you know the JS is running
console.log("main.js loaded");

// OPTIONAL: Supabase client via CDN (safe to use anon key on frontend)
// Do NOT ever paste your service_role key in here.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://imcdogitkzynrxcfgezw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltY2RvZ2l0a3p5bnJ4Y2ZnZXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODM1NDcsImV4cCI6MjA3NTE1OTU0N30.5wSCcFEkOraoWOFkOY8BSfu-lrTzUiyzOTihUTEz03w";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// very simple UI hooks
const form = document.getElementById("upload-form");
const fileInput = document.getElementById("file");
const noteInput = document.getElementById("note");
const queueDiv = document.getElementById("queue");

// (1) render a tiny “it works” message
queueDiv.innerHTML = `<div class="item">App connected. Add your real upload logic next.</div>`;

// (2) demo: prevent default submit so the page doesn’t reload
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = fileInput.files?.[0];
  const note = noteInput.value.trim();
  if (!file) {
    alert("Pick a file first");
    return;
  }
  // placeholder action — just fake-append to the list
  const li = document.createElement("div");
  li.className = "item";
  li.textContent = `Queued: ${file.name}${note ? " — " + note : ""}`;
  queueDiv.prepend(li);

  // clear inputs
  fileInput.value = "";
  noteInput.value = "";
});