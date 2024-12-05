from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from datetime import timedelta

# 初始化Flask应用
app = Flask(__name__, 
            static_folder='../static',
            template_folder='../templates')

# 配置
app.config['SECRET_KEY'] = 'your-secret-key'  
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'jwt-secret-key'  
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# 初始化扩展
db = SQLAlchemy(app)
jwt = JWTManager(app)

from app import routes, models  # 避免循环导入 