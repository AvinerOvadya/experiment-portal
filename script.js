const WEB_APP_URL = [
  "https://script.google.",
  "com/macros/s/",
  "AKfycby8HQoXlAJalIyBVpjPYTLx-mv_yK9JfVY7qQteXBjHafkO198MWEPOSMiQLuJ71B3_kw",
  "/exec"
].join("");

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginBox").style.display = "block";
});

async function submitPhone() {
  const phone = document.getElementById("phoneInput").value.trim();
  const error = document.getElementById("error");
  error.textContent = "";

  if (!/^\d{10,}$/.test(phone)) {
    error.textContent = "Please enter a valid phone number (at least 10 digits).";
    return;
  }

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("loadingBox").style.display = "block";

  let tapDone = false;
  let sncDone = false;

  try {
    const url = `${WEB_APP_URL}?phone=${encodeURIComponent(phone)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "ok" && data.experiments) {
      tapDone = data.experiments.Tap;
      sncDone = data.experiments.SNC;
    }
  } catch (err) {
    console.warn("API request failed. Assuming no tests done.");
  }

  const container = document.getElementById("buttonContainer");
  container.innerHTML = "";

  const redirectUrl = "https://mudra.youcanbook.me/";

  if (!tapDone && !sncDone) {
    const btn = createExperimentButton("Session #1", "active", () => window.location.href = redirectUrl);
    container.appendChild(btn);
  } else {
    let testIndex = 1;

    const tapBtn = createExperimentButton(`Session #${testIndex++}`, tapDone ? "inactive" : "active", () => {
      if (!tapDone) window.location.href = redirectUrl;
    });
    container.appendChild(tapBtn);

    const sncBtn = createExperimentButton(`Session #${testIndex++}`, sncDone ? "inactive" : "active", () => {
      if (!sncDone) window.location.href = redirectUrl;
    });
    container.appendChild(sncBtn);

    if (tapDone && sncDone) {
      const upcomingBtn = createExperimentButton(`Session #${testIndex}`, "comingsoon", showComingSoonMessage);
      container.appendChild(upcomingBtn);
    }
  }

  document.getElementById("loadingBox").style.display = "none";
  document.getElementById("experimentBox").style.display = "flex";
}

function createExperimentButton(text, type, onClick) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.className = `experiment ${type}`;
  if (onClick) btn.onclick = onClick;
  return btn;
}

function showComingSoonMessage() {
  const container = document.getElementById("buttonContainer");

  const existing = document.getElementById("comingSoonMessage");
  if (existing) {
    existing.remove();
  }

  const msg = document.createElement("div");
  msg.id = "comingSoonMessage";
  msg.className = "flash-message";
  msg.textContent = "We'll be available soon";
  container.appendChild(msg);

  setTimeout(() => {
    msg.remove();
  }, 3000);
}
