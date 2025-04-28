document.getElementById("settings-time-step").value =
  sessionStorage.getItem("dt") || 10;
document.getElementById("settings-position-count").value =
  sessionStorage.getItem("N") || 100;
document.getElementById("settings-position-step").value =
  sessionStorage.getItem("dx") || 10;

document.getElementById("settings-time-step").addEventListener("input", (e) => {
  sessionStorage.setItem(
    "dt",
    parseFloat(e.target.value) || parseFloat(e.target.defaultValue)
  );
});

document
  .getElementById("settings-position-count")
  .addEventListener("input", (e) => {
    sessionStorage.setItem(
      "N",
      parseFloat(e.target.value) || parseFloat(e.target.defaultValue)
    );
  });

document
  .getElementById("settings-position-step")
  .addEventListener("input", (e) => {
    sessionStorage.setItem(
      "dx",
      parseFloat(e.target.value) || parseFloat(e.target.defaultValue)
    );
  });

const elements = document.getElementsByTagName("input");

for (let i = 0; i < elements.length; i++) {
  elements[i].addEventListener("input", (e) => {
    // console.log(e)
    const min = parseFloat(e.target.min);
    const max = parseFloat(e.target.max);
    const val = e.target.value;

    if (parseFloat(val) < min) {
      e.target.value = min;
      e.target.dispatchEvent(new Event("input"));
    }
    if (parseFloat(val) > max) {
      e.target.value = max;
      e.target.dispatchEvent(new Event("input"));
    }
  });
}
