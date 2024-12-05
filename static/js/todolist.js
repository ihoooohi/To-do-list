document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    const todoList = document.getElementById('todoList');
    const addTodoForm = document.getElementById('addTodoForm');
    const editModal = document.getElementById('editModal');
    const editTodoForm = document.getElementById('editTodoForm');
    const logoutBtn = document.getElementById('logoutBtn');
    let currentEditingTodoId = null;

    // 获取所有待办事项
    async function fetchTodos() {
        try {
            const response = await fetch('/api/todos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const todos = await response.json();
                renderTodos(todos);
            } else if (response.status === 401) {
                // Token过期或无效
                localStorage.removeItem('token');
                window.location.href = '/';
            }
        } catch (error) {
            console.error('获取待办事项失败:', error);
        }
    }

    // 渲染待办事项列表
    function renderTodos(todos) {
        todoList.innerHTML = '';
        const template = document.getElementById('todoTemplate');

        todos.forEach(todo => {
            const todoElement = template.content.cloneNode(true);
            const todoItem = todoElement.querySelector('.todo-item');
            const checkbox = todoElement.querySelector('.todo-checkbox');
            const title = todoElement.querySelector('.todo-title');
            const description = todoElement.querySelector('.todo-description');

            todoItem.dataset.id = todo.id;
            checkbox.checked = todo.completed;
            title.textContent = todo.title;
            description.textContent = todo.description || '';

            // 添加事件监听器
            checkbox.addEventListener('change', () => toggleTodoStatus(todo.id, checkbox.checked));
            todoElement.querySelector('.edit-btn').addEventListener('click', () => showEditModal(todo));
            todoElement.querySelector('.delete-btn').addEventListener('click', () => deleteTodo(todo.id));

            todoList.appendChild(todoElement);
        });
    }

    // 添加新待办事项
    addTodoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('newTodoTitle').value;
        const description = document.getElementById('newTodoDescription').value;

        try {
            const response = await fetch('/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, description })
            });

            if (response.ok) {
                addTodoForm.reset();
                fetchTodos();
            }
        } catch (error) {
            console.error('添加待办事项失败:', error);
        }
    });

    // 显示编辑模态框
    function showEditModal(todo) {
        currentEditingTodoId = todo.id;
        document.getElementById('editTodoTitle').value = todo.title;
        document.getElementById('editTodoDescription').value = todo.description || '';
        editModal.style.display = 'block';
    }

    // 处理编辑表单提交
    editTodoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('editTodoTitle').value;
        const description = document.getElementById('editTodoDescription').value;

        try {
            const response = await fetch(`/api/todos/${currentEditingTodoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, description })
            });

            if (response.ok) {
                editModal.style.display = 'none';
                fetchTodos();
            }
        } catch (error) {
            console.error('更新待办事项失败:', error);
        }
    });

    // 切换待办事项状态
    async function toggleTodoStatus(todoId, completed) {
        try {
            const response = await fetch(`/api/todos/${todoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ completed })
            });

            if (!response.ok) {
                throw new Error('更新状态失败');
            }
        } catch (error) {
            console.error('更新待办事项状态失败:', error);
            fetchTodos(); // 刷新列表以恢复正确状态
        }
    }

    // 删除待办事项
    async function deleteTodo(todoId) {
        if (!confirm('��定要删除这个待办事项吗？')) {
            return;
        }

        try {
            const response = await fetch(`/api/todos/${todoId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchTodos();
            }
        } catch (error) {
            console.error('删除待办事项失败:', error);
        }
    }

    // 关闭编辑模态框
    document.getElementById('cancelEdit').addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.style.display = 'none';
        }
    });

    // 处理登出
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    });

    // 初始加载待办事项
    fetchTodos();
}); 