let salary = 0;
let expenses = [];
let chartInstance = null;

// ─── SALARY ───────────────────────────────────────────────
function setSalary() {
    const val = Number(document.getElementById("salary").value);
    if (isNaN(val) || val < 0) {
        alert("Please enter a valid salary amount.");
        return;
    }
    salary = val;
    document.getElementById("totalSalary").innerText = salary;
    updateBalance();
    saveData();
}

// ─── ADD EXPENSE ──────────────────────────────────────────
function addExpense() {
    const name = document.getElementById("expenseName").value.trim();
    const amount = Number(document.getElementById("expenseAmount").value);

    if (name === "" || amount <= 0 || isNaN(amount)) {
        alert("Please enter a valid expense name and amount.");
        return;
    }

    expenses.push({ name, amount });

    // Clear input fields after adding
    document.getElementById("expenseName").value = "";
    document.getElementById("expenseAmount").value = "";

    displayExpenses();
    updateBalance();
    saveData();
}

// ─── DISPLAY EXPENSES ─────────────────────────────────────
function displayExpenses() {
    const list = document.getElementById("expenseList");
    list.innerHTML = "";

    expenses.forEach((exp, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${exp.name} — ₹${exp.amount}</span>
            <button onclick="deleteExpense(${index})">❌</button>
        `;
        list.appendChild(li);
    });
}

// ─── DELETE EXPENSE ───────────────────────────────────────
function deleteExpense(index) {
    expenses.splice(index, 1);
    displayExpenses();
    updateBalance();
    saveData();
}

// ─── UPDATE BALANCE + BUDGET ALERT ────────────────────────
function updateBalance() {
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const balance = salary - totalExpense;

    const balanceEl = document.getElementById("balance");
    balanceEl.innerText = balance;

    if (salary > 0 && balance < salary * 0.1) {
        balanceEl.classList.add("low");
        if (balance >= 0) {
            alert("⚠ Warning: Your balance is below 10% of your salary!");
        }
    } else {
        balanceEl.classList.remove("low");
    }

    if (balance < 0) {
        balanceEl.style.color = "#e60000";
    }

    renderChart(totalExpense, balance);
}

// ─── CHART ────────────────────────────────────────────────
function renderChart(totalExpense, balance) {
    // Destroy old chart before creating a new one
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Only render chart if there's data
    if (salary <= 0 && totalExpense <= 0) return;

    chartInstance = new Chart(document.getElementById("myChart"), {
        type: 'pie',
        data: {
            labels: ["Expenses", "Balance"],
            datasets: [{
                data: [totalExpense, Math.max(balance, 0)],
                backgroundColor: ["#ff6b6b", "#667eea"],
                borderColor: ["#fff", "#fff"],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 13 }
                    }
                }
            }
        }
    });
}

// ─── LOCAL STORAGE ────────────────────────────────────────
function saveData() {
    localStorage.setItem("cashflow_salary", salary);
    localStorage.setItem("cashflow_expenses", JSON.stringify(expenses));
}

function loadData() {
    salary = Number(localStorage.getItem("cashflow_salary")) || 0;
    expenses = JSON.parse(localStorage.getItem("cashflow_expenses")) || [];

    document.getElementById("totalSalary").innerText = salary;
    displayExpenses();
    updateBalance();
}

// ─── PDF EXPORT ───────────────────────────────────────────
function downloadPDF() {
    if (expenses.length === 0 && salary === 0) {
        alert("Nothing to export yet. Add your salary and expenses first.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const balance = salary - totalExpense;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Cash-Flow Report", 105, 18, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Salary: Rs. ${salary}`, 14, 40);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Expenses:", 14, 54);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    if (expenses.length === 0) {
        doc.text("No expenses added.", 14, 64);
    } else {
        expenses.forEach((exp, i) => {
            doc.text(`${i + 1}. ${exp.name}: Rs. ${exp.amount}`, 14, 64 + i * 10);
        });
    }

    const afterList = 64 + expenses.length * 10 + 10;

    doc.setDrawColor(180, 180, 180);
    doc.line(14, afterList, 196, afterList);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Expenses: Rs. ${totalExpense}`, 14, afterList + 10);
    doc.text(`Remaining Balance: Rs. ${balance}`, 14, afterList + 20);

    doc.save("cashflow-report.pdf");
}

// ─── INIT ─────────────────────────────────────────────────
window.onload = loadData;