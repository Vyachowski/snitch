// Modal window
const modal = document.getElementById("modal-overlay");
const openBtn = document.getElementById("open-modal");
const closeBtn = document.getElementById("close-modal");

function openModal() {
  modal.classList.add("modal--active");
}

function closeModal() {
  modal.classList.remove("modal--active");
}

openBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);

// Close modal if click outside the box
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Add site button (just placeholder for now)
const addBtn = document.getElementById("add-site");
addBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const siteInput = document.getElementById("site-address");
  if (siteInput.value.trim() === "") {
    alert("Введите адрес сайта!");
    return;
  }

  console.log("Добавляем сайт:", siteInput.value);
  siteInput.value = "";
  closeModal();
});
