from flask import jsonify, request, render_template
from app import app, db
from app.models import User, Todo
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

# 页面路由
@app.route('/')
def index():
    return render_template('login.html')

@app.route('/todolist')
def todolist():
    return render_template('todolist.html')

# API路由
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': '用户名已存在'}), 400
    
    user = User()
    user.username = data['username']
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': '注册成功'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({'access_token': access_token}), 200
    
    return jsonify({'error': '用户名或密码错误'}), 401

@app.route('/api/todos', methods=['GET', 'POST'])
@jwt_required()
def todos():
    current_user_id = get_jwt_identity()
    
    if request.method == 'GET':
        todos = Todo.query.filter_by(user_id=current_user_id).all()
        return jsonify([{
            'id': todo.id,
            'title': todo.title,
            'description': todo.description,
            'completed': todo.completed,
            'created_at': todo.created_at.isoformat()
        } for todo in todos])
    
    data = request.get_json()
    todo = Todo(
        title=data['title'],
        description=data.get('description', ''),
        user_id=current_user_id
    )
    db.session.add(todo)
    db.session.commit()
    
    return jsonify({
        'id': todo.id,
        'title': todo.title,
        'description': todo.description,
        'completed': todo.completed,
        'created_at': todo.created_at.isoformat()
    }), 201

@app.route('/api/todos/<int:todo_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def todo(todo_id):
    current_user_id = get_jwt_identity()
    todo = Todo.query.filter_by(id=todo_id, user_id=current_user_id).first_or_404()
    
    if request.method == 'GET':
        return jsonify({
            'id': todo.id,
            'title': todo.title,
            'description': todo.description,
            'completed': todo.completed,
            'created_at': todo.created_at.isoformat()
        })
    
    elif request.method == 'PUT':
        data = request.get_json()
        todo.title = data.get('title', todo.title)
        todo.description = data.get('description', todo.description)
        todo.completed = data.get('completed', todo.completed)
        db.session.commit()
        
        return jsonify({
            'id': todo.id,
            'title': todo.title,
            'description': todo.description,
            'completed': todo.completed,
            'created_at': todo.created_at.isoformat()
        })
    
    else:  # DELETE
        db.session.delete(todo)
        db.session.commit()
        return '', 204 