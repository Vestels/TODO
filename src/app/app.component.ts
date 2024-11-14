import { Component, OnInit, Renderer2 } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { TodoModel } from './models/todo-model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'TODO';
  mode: ProgressSpinnerMode = 'determinate';
  value: number = 70;

  maxTodos: number = 0;
  finishedTodos: number = 0;

  todoInput: TodoModel = new TodoModel();

  todos: TodoModel[] = [];
  todosDone: TodoModel[] = [];

  isFinished: boolean = false;
  toggleEdit: boolean = false;
  constructor(private renderer: Renderer2, private snackBar: MatSnackBar) {}


  ngOnInit(): void {
    this.get()
    this.calculateValue()
    if(this.todos.length < 1 && this.todosDone.length < 1) {
      this.value = 70
    }    
  }

  set() {
    localStorage.setItem('Todos', JSON.stringify(this.todos))
    localStorage.setItem('TodosDone', JSON.stringify(this.todosDone))
  }

  get() {
    this.todos = localStorage.getItem('Todos') ? JSON.parse(localStorage.getItem('Todos')!) : [];
    this.todosDone = localStorage.getItem('TodosDone') ? JSON.parse(localStorage.getItem('TodosDone')!) : [];
  }

  editTodo(index: number) {
    this.todos[index].toggleEdit = true;
    this.set()
  }

  saveTodo(index: number) {
    const editedText = this.todos[index].text.trim();
    const isDuplicate = this.todos.some(
      (todo, i) => i !== index && todo.text.trim() === editedText
    );
    if (isDuplicate) {
      this.snackBar.open('This Todo already exists!', 'OK', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }
    this.todos[index].toggleEdit = false;
    this.set()
  }

  resetTodos() {
    this.todos = [];
    this.todosDone = [];
    this.todoInput.text = '';
    this.calculateValue();
    setTimeout(() => {
      this.value = 70;
    }, 500);
    this.set()
  }

  calculateValue() {
    this.maxTodos = this.todos.length;
    this.finishedTodos = this.todosDone.length;
    this.value = this.finishedTodos / (this.maxTodos / 100);
  }

  addTodo(): void {
    if (
      this.todos.some(
        (x) => x.text.toLowerCase() === this.todoInput.text.toLowerCase()
      )
    ) {
      this.snackBar.open('This Todo already exists!', 'OK', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    } else {
      this.todos.unshift(this.todoInput);
      this.todoInput = new TodoModel();
      this.calculateValue();
      this.set()
    }
  }

  deleteTodo(todoModel: TodoModel) {
    this.todos = this.todos.filter(
      (x) => x.text.toLowerCase() != todoModel.text.toLowerCase()
    );
    this.calculateValue();
    this.set()
  }

  finishTodo(todoModel: TodoModel, element: HTMLDivElement, index: number) {
    this.todos[index].toggleEdit = false;
    this.renderer.addClass(element, 'finished');
    this.todos = this.todos.filter(
      (x) => x.text.toLowerCase() != todoModel.text.toLowerCase()
    );
    todoModel.finished = true;
    this.todos.push(todoModel);
    this.todosDone.unshift(todoModel);
    this.calculateValue();
    this.set()
  }

  reverseTodo(todoModel: TodoModel, element: HTMLDivElement) {
    this.renderer.removeClass(element, 'finished');
    this.todosDone = this.todosDone.filter(
      (x) => x.text.toLowerCase() != todoModel.text.toLowerCase()
    );
    this.todos = this.todos.filter(
      (x) => x.text.toLowerCase() != todoModel.text.toLowerCase()
    );
    todoModel.finished = false;
    this.todos.unshift(todoModel);
    this.calculateValue();
    this.set()
  }
}
