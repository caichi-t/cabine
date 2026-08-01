(() => {
  const options = document.querySelector(".split-options");
  const yourBalance = document.querySelector("#your-balance");
  const partnerBalance = document.querySelector("#partner-balance");
  const balanceLabel = document.querySelector("#balance-label");
  const balanceStatus = document.querySelector("#balance-status");

  if (!options || !yourBalance || !partnerBalance || !balanceLabel || !balanceStatus) {
    return;
  }

  const examples = {
    half: {
      label: "折半の場合",
      yourAmount: 2250,
      partnerAmount: 2250,
    },
    ratio: {
      label: "手取り比率 4:6の場合",
      yourAmount: 1800,
      partnerAmount: 2700,
    },
    personal: {
      label: "個人の買い物",
      yourAmount: 4500,
      partnerAmount: 0,
    },
  };

  const buttons = options.querySelectorAll("button[data-split]");
  const numberFormatter = new Intl.NumberFormat("ja-JP");
  const activeAnimations = new WeakMap();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const formatAmount = (amount) => `¥${numberFormatter.format(amount)}`;

  const currentAmount = (element) => {
    const value = Number(element.textContent.replace(/[^0-9]/g, ""));
    return Number.isFinite(value) ? value : 0;
  };

  const animateAmount = (element, nextAmount) => {
    const previousFrame = activeAnimations.get(element);
    if (previousFrame) {
      window.cancelAnimationFrame(previousFrame);
    }

    const startAmount = currentAmount(element);
    element.classList.remove("is-changing");
    void element.offsetWidth;
    element.classList.add("is-changing");

    if (reduceMotion.matches || startAmount === nextAmount) {
      element.textContent = formatAmount(nextAmount);
      return;
    }

    const duration = 460;
    const startedAt = window.performance.now();

    const update = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const amount = Math.round(startAmount + (nextAmount - startAmount) * easedProgress);
      element.textContent = formatAmount(amount);

      if (progress < 1) {
        activeAnimations.set(element, window.requestAnimationFrame(update));
      } else {
        activeAnimations.delete(element);
      }
    };

    activeAnimations.set(element, window.requestAnimationFrame(update));
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const example = examples[button.dataset.split];
      if (!example || button.getAttribute("aria-pressed") === "true") {
        return;
      }

      buttons.forEach((candidate) => {
        candidate.setAttribute("aria-pressed", String(candidate === button));
      });

      balanceLabel.textContent = example.label;
      animateAmount(yourBalance, example.yourAmount);
      animateAmount(partnerBalance, example.partnerAmount);
      balanceStatus.textContent = `${example.label}、あなた${formatAmount(example.yourAmount)}、パートナー${formatAmount(example.partnerAmount)}`;
    });
  });
})();
