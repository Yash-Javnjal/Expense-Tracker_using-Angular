import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { Expense, EXPENSE_CATEGORIES } from '../../models/expense.model';
import { ExpenseService } from '../../services/expense.service';

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
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
}
