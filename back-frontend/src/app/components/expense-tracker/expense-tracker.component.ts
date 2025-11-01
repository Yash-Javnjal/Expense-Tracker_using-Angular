import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { Expense, EXPENSE_CATEGORIES } from '../../models/expense.model';
import { ExpenseService } from '../../services/expense.service';

// 1. IMPORT CHART.JS (as per the documentation)
import { Chart, registerables } from 'chart.js/auto';

// 2. REGISTER CHART.JS COMPONENTS
Chart.register(...registerables);

@Component({
  selector: 'app-expense-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbModalModule],
  templateUrl: './expense-tracker.component.html',
  styleUrls: ['./expense-tracker.component.css']
})
export class ExpenseTrackerComponent implements OnInit, OnDestroy {
  expense: Expense[] = [];
  filteredExpenses: Expense[] = [];
  expenseForm: FormGroup;
  isEditing = false;
  editingExpenseId: number | null = null;
  selectedCategory = '';
  sortBy = 'date';
  isDarkMode = false;
  categories = EXPENSE_CATEGORIES;
  private subscription: Subscription = new Subscription();
  messageText: string | null = null;
  messageType: 'success' | 'error' | null = null;

  // 3. ADD A PROPERTY TO HOLD THE CHART INSTANCE
  public categoryChart: any;

  constructor(
    private expenseService: ExpenseService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {
    this.expenseForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.subscription.add(
      this.expenseService.expense$.subscribe(expense => {
        this.expense = expense;
        this.filteredExpenses = [...expense];
        this.sortExpenses();
        
        // 4. CALL THE FUNCTION TO CREATE/UPDATE THE CHART WHEN DATA ARRIVES
        this.createMonthlyCategoryChart();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    // 5. (Optional but good practice) Destroy the chart on component destroy
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }
  }

  // Form submission
  onSubmit(): void {
    if (this.expenseForm.valid) {
      const expenseData: Expense = {
        ...this.expenseForm.value,
        date: new Date().toISOString()
      };

      if (this.isEditing && this.editingExpenseId) {
        this.expenseService.updateExpense(this.editingExpenseId, expenseData).subscribe({
          next: () => {
            this.resetForm();
            this.expenseService.refreshExpenses();
            this.showAlert('Expense updated successfully!', 'success');
          },
          error: (error) => {
            console.error('Error updating expense:', error);
            this.showAlert('Failed to update expense', 'error');
          }
        });
      } else {
        this.expenseService.createExpense(expenseData).subscribe({
          next: () => {
            this.resetForm();
            this.expenseService.refreshExpenses();
            this.showAlert('Expense added successfully!', 'success');
          },
          error: (error) => {
            console.error('Error creating expense:', error);
            this.showAlert('Failed to add expense', 'error');
          }
        });
      }
    }
  }

  // Edit expense
  editExpense(expense: Expense): void {
    this.isEditing = true;
    this.editingExpenseId = expense.id!;
    this.expenseForm.patchValue({
      amount: expense.amount,
      category: expense.category,
      description: expense.description
    });
  }

  // Delete expense
  deleteExpense(id: number): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id).subscribe({
        next: () => {
          this.expenseService.refreshExpenses();
          this.showAlert('Expense deleted successfully!', 'success');
        },
        error: (error) => {
          console.error('Error deleting expense:', error);
          this.showAlert('Failed to delete expense', 'error');
        }
      });
    }
  }

  // Filter by category
  filterByCategory(category: string): void {
    this.selectedCategory = category;
  }

  // Sort expenses
  onSortChange(): void {
    this.sortExpenses();
  }

  private sortExpenses(): void {
    this.filteredExpenses.sort((a, b) => {
      switch (this.sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'category':
          return a.category.localeCompare(b.category);
        case 'date':
        default:
          return new Date(b.date!).getTime() - new Date(a.date!).getTime();
      }
    });
  }

  // Reset form
  resetForm(): void {
    this.expenseForm.reset();
    this.isEditing = false;
    this.editingExpenseId = null;
  }

  // Toggle dark mode
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    
    // Re-create the chart when dark mode changes so text color is correct
    this.createMonthlyCategoryChart();
  }

  // Get category icon
  getCategoryIcon(category: string): string {
    const categoryObj = this.categories.find(cat => cat.value === category);
    return categoryObj ? categoryObj.icon : '📋';
  }

  // Get category label
  getCategoryLabel(category: string): string {
    const categoryObj = this.categories.find(cat => cat.value === category);
    return categoryObj ? categoryObj.label : category;
  }

  // Calculate statistics
  get stats() {
    const totalAmount = this.expense.reduce((sum, expense) => sum + expense.amount, 0);
    const totalEntries = this.expense.length;
    const averageAmount = totalEntries > 0 ? totalAmount / totalEntries : 0;

    return {
      totalAmount,
      totalEntries,
      averageAmount
    };
  }

  // Monthly totals and category breakdown for current month
  get monthlyTotalAmount(): number {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return this.expense
      .filter(e => {
        const d = new Date(e.date!);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }

  get monthlyCategoryBreakdown(): Array<{ label: string; amount: number; }> {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const breakdown = new Map<string, number>();
    this.expense.forEach(e => {
      const d = new Date(e.date!);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const current = breakdown.get(e.category) || 0;
        breakdown.set(e.category, current + e.amount);
      }
    });
    return Array.from(breakdown.entries()).map(([cat, amt]) => ({
      label: this.getCategoryLabel(cat),
      amount: amt
    }));
  }

  // Category filtered list for the right panel
  get categoryFilteredExpenses(): Expense[] {
    if (!this.selectedCategory) return [];
    return this.expense.filter(e => e.category === this.selectedCategory);
  }

  // Show message in the message-area like the static script
  private showAlert(message: string, type: 'success' | 'error'): void {
    this.messageText = message;
    this.messageType = type;
    setTimeout(() => {
      this.messageText = null;
      this.messageType = null;
    }, 4000);
  }

  // 6. ADD THE NEW FUNCTION TO CREATE THE DOUGHNUT CHART
  private createMonthlyCategoryChart(): void {
    // A. Get the data from your existing getter
    const data = this.monthlyCategoryBreakdown;

    // B. Get the canvas element from the HTML
    const canvas = document.getElementById('monthlyCategoryChart') as HTMLCanvasElement;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // C. Destroy any old chart instance to prevent errors
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }

    // D. Check if there's data. If not, don't do anything.
    if (data.length === 0) {
      return; // No data, no chart
    }

    // E. Prepare labels and data for the chart
    const chartLabels = data.map(d => d.label);
    const chartData = data.map(d => d.amount);

    // F. Create the new chart
    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'Expenses',
          data: chartData,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',  // Red
            'rgba(54, 162, 235, 0.6)',  // Blue
            'rgba(255, 206, 86, 0.6)', // Yellow
            'rgba(75, 192, 192, 0.6)',  // Teal
            'rgba(153, 102, 255, 0.6)', // Purple
            'rgba(255, 159, 64, 0.6)', // Orange
            'rgba(40, 167, 69, 0.6)'
          ],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              // This ensures legend labels are readable in dark mode
              color: this.isDarkMode ? '#FFFFFF' : '#000000'
            }
          }
        }
      }
    });
  }
}