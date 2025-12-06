// Modal window
const modal = document.getElementById("modal-overlay");
const modalBox = document.getElementById("modal-box");
const openBtn = document.getElementById("open-modal");
const closeBtn = document.getElementById("close-modal");

function openModal() {
  modal.classList.remove("pointer-events-none", "opacity-0");
  modalBox.classList.remove("scale-95");
}

function closeModal() {
  modal.classList.add("opacity-0", "pointer-events-none");
  modalBox.classList.add("scale-95");
}

openBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Add site
