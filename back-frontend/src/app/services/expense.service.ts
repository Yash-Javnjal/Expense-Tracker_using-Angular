import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Expense, ExpenseStats } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
 private apiUrl = 'http://localhost:8080/api/expense';
   private expensesSubject = new BehaviorSubject<Expense[]>([]);
  public expense$ = this.expensesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadExpenses();
  }

  // Load all expense
  loadExpenses(): void {
    this.http.get<Expense[]>(this.apiUrl).subscribe({
      next: (expense) => {
        this.expensesSubject.next(expense);
      },
      error: (error) => {
        console.error('Error loading expense:', error);
        this.expensesSubject.next([]);
      }
    });
  }

  // Get all expense
  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.apiUrl);
  }

  // Get expense by ID
  getExpenseById(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/${id}`);
  }

  // Create new expense
  createExpense(expense: Expense): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, expense);
  }

  // Update expense
  updateExpense(id: number, expense: Expense): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/${id}`, expense);
  }

  // Delete expense
  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Calculate expense statistics
  calculateStats(expense: Expense[]): ExpenseStats {
    const totalAmount = expense.reduce((sum, expense) => sum + expense.amount, 0);
    const totalEntries = expense.length;
    const averageAmount = totalEntries > 0 ? totalAmount / totalEntries : 0;

    // Calculate monthly breakdown
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyExpenses = expense.filter(expense => {
      const expenseDate = new Date(expense.date!);
      return expenseDate.getMonth() === currentMonth &&
             expenseDate.getFullYear() === currentYear;
    });

    const categoryBreakdown = new Map<string, number>();
    monthlyExpenses.forEach(expense => {
      const current = categoryBreakdown.get(expense.category) || 0;
      categoryBreakdown.set(expense.category, current + expense.amount);
    });

    const monthlyBreakdown: any[] = [];
    categoryBreakdown.forEach((amount, category) => {
      monthlyBreakdown.push({
        category,
        amount,
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
      });
    });

    return {
      totalAmount,
      totalEntries,
      averageAmount,
      monthlyBreakdown
    };
  }

  // Refresh expense data
  refreshExpenses(): void {
    this.loadExpenses();
  }
}
