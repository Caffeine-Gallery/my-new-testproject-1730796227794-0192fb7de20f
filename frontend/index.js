import { backend } from 'declarations/backend';

let displayValue = '0';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;

const display = document.getElementById('display');
const buttons = document.querySelectorAll('button');
const loadingIndicator = document.getElementById('loading');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        const buttonContent = button.textContent;

        if (action === 'number') {
            inputNumber(buttonContent);
        } else if (action === 'decimal') {
            inputDecimal();
        } else if (action === 'operator') {
            inputOperator(buttonContent);
        } else if (action === 'clear') {
            clearCalculator();
        } else if (action === 'calculate') {
            calculate();
        }

        updateDisplay();
    });
});

function inputNumber(number) {
    if (waitingForSecondOperand) {
        displayValue = number;
        waitingForSecondOperand = false;
    } else {
        displayValue = displayValue === '0' ? number : displayValue + number;
    }
}

function inputDecimal() {
    if (!displayValue.includes('.')) {
        displayValue += '.';
    }
}

function inputOperator(nextOperator) {
    const inputValue = parseFloat(displayValue);

    if (firstOperand === null) {
        firstOperand = inputValue;
    } else if (operator) {
        calculate();
    }

    waitingForSecondOperand = true;
    operator = nextOperator;
}

function clearCalculator() {
    displayValue = '0';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
}

async function calculate() {
    if (operator === null || waitingForSecondOperand) {
        return;
    }

    const secondOperand = parseFloat(displayValue);
    let result;

    loadingIndicator.style.display = 'block';

    try {
        switch (operator) {
            case '+':
                result = await backend.add(firstOperand, secondOperand);
                break;
            case '-':
                result = await backend.subtract(firstOperand, secondOperand);
                break;
            case '*':
                result = await backend.multiply(firstOperand, secondOperand);
                break;
            case '/':
                const divisionResult = await backend.divide(firstOperand, secondOperand);
                result = divisionResult[0] !== null ? divisionResult[0] : 'Error';
                break;
        }

        displayValue = String(result);
        firstOperand = result;
        operator = null;
        waitingForSecondOperand = false;
    } catch (error) {
        console.error('Error during calculation:', error);
        displayValue = 'Error';
    } finally {
        loadingIndicator.style.display = 'none';
    }

    updateDisplay();
}

function updateDisplay() {
    display.textContent = displayValue;
}
