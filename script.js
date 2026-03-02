document.addEventListener("DOMContentLoaded", () => {
  const equationContainer = document.getElementById("equation-container")
  const equationInput = document.getElementById("equation-input")
  const renderBtn = document.getElementById("render-btn")

  renderBtn.addEventListener("click", () => {
    const equation = equationInput.value
    const renderedEquation = renderEquation(equation)
    equationContainer.innerHTML = renderedEquation
  })

  function renderEquation(equation) {
    // Replace fractions
    equation = equation.replace(
      /(\d+)\/(\d+)/g,
      '<span class="fraction"><span class="numerator">$1</span><span class="denominator">$2</span></span>',
    )

    // Replace exponents
    equation = equation.replace(/\^(\d+)/g, '<sup class="exponent">$1</sup>')

    // Replace square roots
    equation = equation.replace(/sqrt$$([^)]+)$$/g, '<span class="sqrt"><span>$1</span></span>')

    // Replace basic operations
    equation = equation.replace(/\+/g, " + ")
    equation = equation.replace(/-/g, " - ")
    equation = equation.replace(/\*/g, " × ")
    equation = equation.replace(/\//g, " ÷ ")

    return `<span class="equation">${equation}</span>`
  }
})
