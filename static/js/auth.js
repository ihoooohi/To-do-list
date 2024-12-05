document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerFormElement = document.getElementById('registerFormElement');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');
    const loginDiv = document.querySelector('.auth-form');
    const registerDiv = document.getElementById('registerForm');

    // 显示注册表单
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginDiv.style.display = 'none';
        registerDiv.style.display = 'block';
    });

    // 显示登录表单
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerDiv.style.display = 'none';
        loginDiv.style.display = 'block';
    });

    // 处理登录
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // 保存token并跳转
                localStorage.setItem('token', data.access_token);
                window.location.href = '/todolist';
            } else {
                alert(data.error || '登录失败');
            }
        } catch (error) {
            alert('登录过程中发生错误');
            console.error('登录错误:', error);
        }
    });

    // 处理注册
    registerFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('两次输入的密码不匹配');
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('注册成功！请登录');
                // 显示登录表单
                registerDiv.style.display = 'none';
                loginDiv.style.display = 'block';
                // 清空注册表单
                registerFormElement.reset();
            } else {
                alert(data.error || '注册失败');
            }
        } catch (error) {
            alert('注册过程中发生错误');
            console.error('注册错误:', error);
        }
    });
}); 