// Utility functions
  function showError(message) {
    alert(message);
  }

  function isValidTransactionRow(row) {
    const [name, date, category, amount, description] = Array.from(row.children).map(td => td.textContent.trim());
    return name && date && category && description && !isNaN(amount) && Number(amount) > 0;
  }

  function validateRowNumbers(row) {
    return Array.from(row.children).every(cell => !isNaN(cell.textContent.trim()) && cell.textContent.trim() !== '');
  }

  function showSection(id) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  const inputs = document.querySelectorAll('.box input:not(#spentInput)');
  const totalDisplay = document.getElementById('totalSalary');
  const spentInput = document.getElementById('spentInput');
  const remainingDisplay = document.getElementById('remainingDisplay');
  const clothesInput = document.getElementById('clothesInput');
  const groceriesInput = document.getElementById('groceriesInput');
  const expensesTotalDisplay = document.getElementById('expensesTotal');
  const incomeValue = document.getElementById('incomeValue');
  const billsValue = document.getElementById('billsValue');
  const expensesValue = document.getElementById('expensesValue');
  const editBtn = document.getElementById('editBtn');
  const editSpentBtn = document.getElementById('editSpentBtn');
  const editExpensesBtn = document.getElementById('editExpensesBtn');
  const transactionsBody = document.getElementById('transactionsBody');

  let incomeEditable = false, spentEditable = false, expensesEditable = false;

  function getSalaryTotal() {
    return Array.from(inputs).reduce((sum, input) => sum + Number(input.value), 0);
  }

  function getBillsTotal() {
    let total = 0;
    document.querySelectorAll('#billTable tbody tr').forEach(row => {
      const actual = row.querySelector('td:nth-child(3)');
      total += Number(actual?.textContent || 0);
    });
    return total;
  }

  function getExpensesTableTotal() {
    let total = 0;
    document.querySelectorAll('#expenseTable tbody tr').forEach(row => {
      const actual = row.querySelector('td:nth-child(2)');
      total += Number(actual?.textContent || 0);
    });
    return total;
  }

  function updatePieChart() {
    const income = getSalaryTotal();
    const bills = getBillsTotal();
    const expenses = getExpensesTableTotal();
    const remaining = Math.max(income - bills - expenses, 0);

    pieChart.data.datasets[0].data = [bills, expenses, remaining];
    pieChart.update();

    incomeValue.textContent = `₹${income.toLocaleString('en-IN')}`;
    billsValue.textContent = `₹${bills.toLocaleString('en-IN')}`;
    expensesValue.textContent = `₹${expenses.toLocaleString('en-IN')}`;
  }

  function updateTotal() {
    const total = getSalaryTotal();
    totalDisplay.textContent = `Monthly Salary: ₹${total.toLocaleString('en-IN')}`;
    updateRemaining();
    updatePieChart();
  }

  function updateRemaining() {
    const salary = getSalaryTotal();
    const spent = Number(spentInput.value);
    remainingDisplay.textContent = `₹${(salary - spent).toLocaleString('en-IN')}`;
  }

  function updateExpensesTotal() {
    const total = Number(clothesInput.value) + Number(groceriesInput.value);
    expensesTotalDisplay.textContent = `₹${total.toLocaleString('en-IN')}`;
  }

  editBtn.addEventListener('click', () => {
    incomeEditable = !incomeEditable;
    inputs.forEach(input => input.disabled = !incomeEditable);
    editBtn.textContent = incomeEditable ? 'Save' : 'Edit';
    if (!incomeEditable) updateTotal();
  });

  editSpentBtn.addEventListener('click', () => {
    spentEditable = !spentEditable;
    spentInput.disabled = !spentEditable;
    editSpentBtn.textContent = spentEditable ? 'Save' : 'Edit';
    if (!spentEditable) updateRemaining();
  });

  editExpensesBtn.addEventListener('click', () => {
    expensesEditable = !expensesEditable;
    clothesInput.disabled = !expensesEditable;
    groceriesInput.disabled = !expensesEditable;
    editExpensesBtn.textContent = expensesEditable ? 'Save' : 'Edit';
    if (!expensesEditable) updateExpensesTotal();
  });

  inputs.forEach(input => input.addEventListener('input', updateTotal));
  spentInput.addEventListener('input', updateRemaining);
  clothesInput.addEventListener('input', updateExpensesTotal);
  groceriesInput.addEventListener('input', updateExpensesTotal);

  // EXPENSE BAR CHART
  const ctx = document.getElementById('expenseChart').getContext('2d');
  const rangeSelect = document.getElementById('rangeSelect');
  const dataMap = {
    day: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [500, 800, 600, 750, 400, 950, 700] },
    month: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], data: [12000, 15000, 11000, 18000, 17000, 14000] },
    year: { labels: ['2020', '2021', '2022', '2023', '2024'], data: [130000, 145000, 160000, 180000, 175000] }
  };

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dataMap.day.labels,
      datasets: [{
        label: 'Expenses (₹)',
        data: dataMap.day.data,
        backgroundColor: '#E3D8FF',
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  rangeSelect.addEventListener('change', () => {
    const selected = rangeSelect.value;
    chart.data.labels = dataMap[selected].labels;
    chart.data.datasets[0].data = dataMap[selected].data;
    chart.update();
  });

  // PIE CHART
  const pieCtx = document.getElementById('budgetPie').getContext('2d');
  const pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: ['Bills', 'Expenses', 'Remaining'],
      datasets: [{
        label: 'Budget Pie',
        data: [0, 0, 0],
        backgroundColor: ['#ff6384', '#36a2eb', '#E3D8FF'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });

  // TRANSACTION FUNCTIONS
  function addTransaction() {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td contenteditable="true">New Name</td>
      <td contenteditable="true">${new Date().toISOString().split('T')[0]}</td>
      <td contenteditable="true">Category</td>
      <td contenteditable="true">0</td>
      <td contenteditable="true">Description</td>
    `;
    row.children[2].addEventListener('input', updateTransactionCategories);
    transactionsBody.appendChild(row);
    updateTransactionCategories();
    saveData();
  }

  function editTransaction() {
    const selectedRow = document.querySelector('.selected');
    if (selectedRow) {
      [...selectedRow.children].forEach(cell => cell.contentEditable = "true");
    } else {
      showError("Please select a row to edit.");
    }
  }

  function deleteTransaction() {
    const selectedRow = document.querySelector('.selected');
    if (selectedRow) {
      selectedRow.remove();
      saveData();
    } else {
      showError("Please select a row to delete.");
    }
  }

  transactionsBody.addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    if (!row) return;
    document.querySelectorAll('#transactionsBody tr').forEach(tr => tr.classList.remove('selected'));
    row.classList.add('selected');
  });

  document.getElementById('filter').addEventListener('change', () => {
    const selected = document.getElementById('filter').value.toLowerCase();
    Array.from(transactionsBody.children).forEach(row => {
      const category = row.children[2]?.textContent.trim().toLowerCase();
      row.style.display = selected === 'all' || category === selected ? '' : 'none';
    });
  });

  function updateTransactionCategories() {
    const categories = new Set();
    Array.from(transactionsBody.children).forEach(row => {
      const category = row.children[2]?.textContent.trim();
      if (category) categories.add(category);
    });

    const filterSelect = document.getElementById('filter');
    const currentValue = filterSelect.value;
    filterSelect.innerHTML = `<option value="all">All</option>`;
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.toLowerCase();
      option.textContent = cat;
      filterSelect.appendChild(option);
    });

    filterSelect.value = currentValue;
  }

  // BUDGET TABLES
  function addBill() {
    const row = document.createElement('tr');
    row.innerHTML = `<td contenteditable="true">Due Name</td><td contenteditable="true">0</td><td contenteditable="true">0</td>`;
    row.addEventListener('input', () => {
      if (!validateRowNumbers(row)) showError('Please enter valid numbers only');
      updatePieChart();
    });
    document.querySelector('#billTable tbody').appendChild(row);
  }

  function addExpense() {
    const row = document.createElement('tr');
    row.innerHTML = `<td contenteditable="true">0</td><td contenteditable="true">0</td><td contenteditable="true">0</td>`;
    row.addEventListener('input', () => {
      if (!validateRowNumbers(row)) showError('Please enter valid numbers only');
      updatePieChart();
    });
    document.querySelector('#expenseTable tbody').appendChild(row);
  }

  // SAVE/LOAD
  function saveData() {
    const salaryInputs = Array.from(inputs).map(input => Number(input.value));
    const spent = Number(spentInput.value);
    const clothes = Number(clothesInput.value);
    const groceries = Number(groceriesInput.value);

    const transactions = Array.from(transactionsBody.children).map(row =>
      Array.from(row.children).map(cell => cell.textContent)
    );
    const bills = Array.from(document.querySelectorAll('#billTable tbody tr')).map(row =>
      Array.from(row.children).map(cell => cell.textContent)
    );
    const expenses = Array.from(document.querySelectorAll('#expenseTable tbody tr')).map(row =>
      Array.from(row.children).map(cell => cell.textContent)
    );

    const data = { salaryInputs, spent, clothes, groceries, transactions, bills, expenses };
    localStorage.setItem('kakeiboData', JSON.stringify(data));
  }

  function loadData() {
    const data = JSON.parse(localStorage.getItem('kakeiboData'));
    if (!data) return;

    inputs.forEach((input, i) => input.value = data.salaryInputs[i] || 0);
    spentInput.value = data.spent || 0;
    clothesInput.value = data.clothes || 0;
    groceriesInput.value = data.groceries || 0;

    transactionsBody.innerHTML = '';
    (data.transactions || []).forEach(rowData => {
      const row = document.createElement('tr');
      row.innerHTML = rowData.map(cell => `<td contenteditable="true">${cell}</td>`).join('');
      transactionsBody.appendChild(row);
    });

    const billTable = document.querySelector('#billTable tbody');
    billTable.innerHTML = '';
    (data.bills || []).forEach(rowData => {
      const row = document.createElement('tr');
      row.innerHTML = rowData.map(cell => `<td contenteditable="true">${cell}</td>`).join('');
      row.addEventListener('input', updatePieChart);
      billTable.appendChild(row);
    });

    const expenseTable = document.querySelector('#expenseTable tbody');
    expenseTable.innerHTML = '';
    (data.expenses || []).forEach(rowData => {
      const row = document.createElement('tr');
      row.innerHTML = rowData.map(cell => `<td contenteditable="true">${cell}</td>`).join('');
      row.addEventListener('input', updatePieChart);
      expenseTable.appendChild(row);
    });

    updateTotal();
    updateRemaining();
    updateExpensesTotal();
    updatePieChart();
    updateTransactionCategories();
  }

  document.addEventListener('input', saveData);
  window.addEventListener('DOMContentLoaded', loadData);
