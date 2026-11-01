
"use client";

import { useState, useEffect, type FormEvent } from "react";

type Expense = {
  id: number;
  name: string;
  category: string;
  amount: number;
  date: string;
};

const initialExpenses: Expense[] = [
  { id: 1, name: "Lunch", category: "Food", amount: 120, date: "2026-10-28" },
  { id: 2, name: "Bus fare", category: "Transport", amount: 40, date: "2026-10-28" },
  { id: 3, name: "Notebook", category: "Education", amount: 85, date: "2026-10-27" },
  { id: 4, name: "Coffee", category: "Food", amount: 60, date: "2026-10-27" },
];

export default function Home() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("2026-10-28");

  const [budget, setBudget] = useState(3000);
  const [budgetInput, setBudgetInput] = useState("3000");

  const [loaded, setLoaded] = useState(false);
  const [budgetLoaded, setBudgetLoaded] = useState(false);

  // Load saved expenses
  useEffect(() => {
    try {
      const saved = localStorage.getItem("spendwise-expenses");

      if (saved) {
        setExpenses(JSON.parse(saved) as Expense[]);
      }
    } catch {
      console.error("Could not load saved expenses.");
    } finally {
      setLoaded(true);
    }
  }, []);

  // Save expenses
  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "spendwise-expenses",
      JSON.stringify(expenses)
    );
  }, [expenses, loaded]);

  // Load saved budget
  useEffect(() => {
    try {
      const savedBudget = localStorage.getItem("spendwise-budget");

      if (savedBudget) {
        const value = Number(savedBudget);

        if (value > 0) {
          setBudget(value);
          setBudgetInput(String(value));
        }
      }
    } catch {
      console.error("Could not load saved budget.");
    } finally {
      setBudgetLoaded(true);
    }
  }, []);

  // Save budget
  useEffect(() => {
    if (!budgetLoaded) return;

    localStorage.setItem("spendwise-budget", String(budget));
  }, [budget, budgetLoaded]);

  const total = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const remaining = Math.max(0, budget - total);
  const percentage = Math.min((total / budget) * 100, 100);

  // Calculate category-wise spending
  const categoryTotals = expenses.reduce<Record<string, number>>(
    (totals, expense) => {
      totals[expense.category] =
        (totals[expense.category] || 0) + expense.amount;
      return totals;
    },
    {}
  );

  const maxCategoryAmount = Math.max(
    ...Object.values(categoryTotals),
    1
  );

  // Add expense
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newExpense: Expense = {
      id: Date.now(),
      name: name.trim(),
      category,
      amount: Number(amount),
      date,
    };

    setExpenses((current) => [...current, newExpense]);
    setName("");
    setAmount("");
  }

  // Delete expense
  function handleDelete(id: number) {
    setExpenses((current) =>
      current.filter((expense) => expense.id !== id)
    );
  }

  // Update budget
  function handleBudgetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newBudget = Number(budgetInput);

    if (newBudget > 0) {
      setBudget(newBudget);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 md:p-10">
      <div className="mx-auto max-w-6xl">

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-blue-700">
            SpendWise
          </h1>
          <p className="mt-2 text-slate-500">
            Your money, made easier.
          </p>
        </header>

        {/* Dashboard summary */}
        <section className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total spent</p>
            <p className="mt-3 text-3xl font-bold">₹{total}</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Monthly budget</p>
            <p className="mt-3 text-3xl font-bold">₹{budget}</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Budget remaining</p>
            <p className="mt-3 text-3xl font-bold text-emerald-600">
              ₹{remaining}
            </p>
          </div>

        </section>

        {/* Set monthly budget */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            Set Monthly Budget
          </h2>

          <form
            onSubmit={handleBudgetSubmit}
            className="flex flex-wrap gap-3"
          >
            <input
              type="number"
              min="1"
              value={budgetInput}
              onChange={(event) => setBudgetInput(event.target.value)}
              className="flex-1 rounded-lg border border-slate-300 p-3"
              placeholder="Enter your budget"
              required
            />

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              Update Budget
            </button>
          </form>
        </section>

        {/* Budget progress */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex justify-between gap-3">
            <h2 className="text-xl font-semibold">
              Budget progress
            </h2>

            <span className="text-sm text-slate-500">
              {Math.round(percentage)}% used
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </section>

        {/* Spending by category */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold">
            Spending by Category
          </h2>

          {Object.keys(categoryTotals).length === 0 ? (
            <p className="text-slate-500">
              No spending data available.
            </p>
          ) : (
            <div className="space-y-5">
              {Object.entries(categoryTotals).map(
                ([category, amount]) => (
                  <div key={category}>
                    <div className="mb-2 flex justify-between">
                      <span className="font-medium">{category}</span>
                      <span className="font-semibold">₹{amount}</span>
                    </div>

                    <div className="h-3 rounded-full bg-slate-100">
                      <div
                        className="h-3 rounded-full bg-blue-600"
                        style={{
                          width: `${(amount / maxCategoryAmount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* Add expense */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold">
            Add an expense
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="mb-1 block text-sm font-medium">
                Description
              </label>

              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Dinner"
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Amount (₹)
              </label>

              <input
                required
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="e.g. 150"
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Category
              </label>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-3"
              >
                <option>Food</option>
                <option>Transport</option>
                <option>Education</option>
                <option>Shopping</option>
                <option>Entertainment</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Date
              </label>

              <input
                required
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 sm:col-span-2"
            >
              + Add Expense
            </button>
          </form>
        </section>

        {/* Recent expenses */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold">
            Recent expenses
          </h2>

          {expenses.length === 0 ? (
            <p className="text-slate-500">
              No expenses added yet.
            </p>
          ) : (
            <div className="space-y-4">
              {[...expenses].reverse().map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">{expense.name}</p>
                    <p className="text-sm text-slate-500">
                      {expense.category} · {expense.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="font-semibold">
                      −₹{expense.amount}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleDelete(expense.id)}
                      className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-8 text-center text-sm text-slate-400">
          SpendWise · Spend mindfully, save wisely.
        </footer>

      </div>
    </main>
  );
}
