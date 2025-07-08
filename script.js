const WEB_APP_URL = [
  "https://script.google.",
  "com/macros/s/",
  "AKfycby8HQoXlAJalIyBVpjPYTLx-mv_yK9JfVY7qQteXBjHafkO198MWEPOSMiQLuJ71B3_kw",
  "/exec"
].join("");

document.addEventListener("DOMContentLoaded", () => {
  console.log("[Init] Page loaded, showing login box.");
  document.getElementById("loginBox").style.display = "block";
});

async function submitPhone() {
  const phone = document.getElementById("phoneInput").value.trim();
  const error = document.getElementById("error");
  error.textContent = "";

  if (!/^\d{10,}$/.test(phone)) {
    error.textContent = "Please enter a valid phone number (at least 10 digits).";
    console.warn("[Validation] Invalid phone number entered.");
    return;
  }

  console.log(`[Submit] Checking phone: ${phone}`);

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("loadingBox").style.display = "block";
  document.getElementById("loadingVideoContainer").style.display = "block";

  let data = null;

  try {
    const url = `${WEB_APP_URL}?phone=${encodeURIComponent(phone)}`;
    const res = await fetch(url);
    data = await res.json();
    console.log("[API] Received data:", data);
  } catch (err) {
    console.error("[API] Failed to fetch data:", err);
    data = null;
  }

  const container = document.getElementById("buttonContainer");
  container.innerHTML = "";

  const redirectUrl = "https://mudra.youcanbook.me/";

  const experimentList = [
    { key: "Tap" },
    { key: "SNC" },
    { key: "Hadas" },
    { key: "Alisa" },
  ];

  if (!data) {
    console.warn("[Flow] No data received from API. Showing Coming Soon only.");
    showComingSoon(container);
    return;
  }

  if (!data.globalAvailability || Object.keys(data.globalAvailability).length === 0) {
    console.warn("[Flow] globalAvailability missing or empty. Showing Coming Soon only.");
    showComingSoon(container);
    return;
  }

  let sessionIndex = 1;

  // First, add all Done buttons (even if experiment is globally unavailable)
  experimentList.forEach(exp => {
    const alreadyDone = data.userExperiments[exp.key] === true;

    if (alreadyDone) {
      console.log(`[Experiment] ${exp.key} is done. Showing Done button as ${exp.key} test.`);
      const doneBtn = createExperimentButton(`${exp.key} test`, "inactive");
      container.appendChild(doneBtn);
    }
  });

  // Then, add the first available Active button
  let activeShown = false;
  for (const exp of experimentList) {
    const isAvailable = data.globalAvailability[exp.key];
    const alreadyDone = data.userExperiments[exp.key] === true;

    if (isAvailable && !alreadyDone) {
      console.log(`[Experiment] ${exp.key} is available. Showing Active button as ${exp.key} test.`);
      const activeBtn = createExperimentButton(`${exp.key} test`, "active", () => {
        window.location.href = redirectUrl;
      });
      container.appendChild(activeBtn);
      activeShown = true;
    }
  }

  // If no active was shown, show Coming Soon
  if (!activeShown) {
    console.log("[Flow] No available experiments left. Showing Coming Soon.");
    showComingSoon(container, sessionIndex);
  }

  document.getElementById("loadingBox").style.display = "none";
  document.getElementById("loadingVideoContainer").style.display = "none";
  document.getElementById("experimentBox").style.display = "flex";
}

function createExperimentButton(text, type, onClick) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.className = `experiment ${type}`;
  if (onClick) btn.onclick = onClick;
  return btn;
}

function showComingSoon(container, sessionIndex) {
  const comingSoonBtn = createExperimentButton(`Next Session`, "comingsoon");
  container.appendChild(comingSoonBtn);
}
