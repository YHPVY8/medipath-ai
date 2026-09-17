(() => {
  "use strict";

  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;

  const track = carousel.querySelector("[data-carousel-track]");
  const slides = [...carousel.querySelectorAll("[data-carousel-slide]")];
  const dots = [...carousel.querySelectorAll("[data-carousel-dot]")];
  const previous = carousel.querySelector("[data-carousel-previous]");
  const next = carousel.querySelector("[data-carousel-next]");
  const caption = carousel.querySelector("[data-carousel-caption]");
  const captions = [
    "Sua biblioteca clínica, organizada e sempre acessível.",
    "Compartilhe casos em espaços privados com médicos selecionados.",
    "Descubra casos compartilhados por outros médicos.",
  ];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = 0;
  let frame;

  const update = (index) => {
    activeIndex = Math.max(0, Math.min(index, slides.length - 1));
    dots.forEach((dot, dotIndex) => dot.setAttribute("aria-current", String(dotIndex === activeIndex)));
    previous.disabled = activeIndex === 0;
    next.disabled = activeIndex === slides.length - 1;
    caption.textContent = captions[activeIndex];
  };

  const goTo = (index) => {
    const target = Math.max(0, Math.min(index, slides.length - 1));
    track.scrollTo({ left: target * track.clientWidth, behavior: reducedMotion.matches ? "auto" : "smooth" });
    update(target);
  };

  dots.forEach((dot, index) => dot.addEventListener("click", () => goTo(index)));
  previous.addEventListener("click", () => goTo(activeIndex - 1));
  next.addEventListener("click", () => goTo(activeIndex + 1));
  track.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    goTo(activeIndex + (event.key === "ArrowRight" ? 1 : -1));
  });
  track.addEventListener("scroll", () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const index = Math.round(track.scrollLeft / track.clientWidth);
      if (index !== activeIndex) update(index);
    });
  }, { passive: true });

  update(0);
})();
