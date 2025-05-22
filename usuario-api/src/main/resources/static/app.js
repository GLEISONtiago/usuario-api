document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'http://localhost:63342/api/usuarios';
    const usuarioForm = document.getElementById('usuarioForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const getAllBtn = document.getElementById('getAllBtn');
    const getByIdBtn = document.getElementById('getByIdBtn');
    const userIdInput = document.getElementById('userIdInput');
    const usuariosTable = document.getElementById('usuariosTable').getElementsByTagName('tbody')[0];
    const singleUserResult = document.getElementById('singleUserResult');
    const formTitle = document.getElementById('form-title');

    let editingId = null;

    // Event Listeners
    usuarioForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', resetForm);
    getAllBtn.addEventListener('click', obterTodosOsUsuarios);
    getByIdBtn.addEventListener('click', obterUsuarioPorId);

    // Carrega todos os usuários ao iniciar
    obterTodosOsUsuarios();

    // 1. Obter todos os usuários
    function obterTodosOsUsuarios() {
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error('Erro ao obter usuários');
                return response.json();
            })
            .then(data => {
                singleUserResult.classList.add('hidden');
                renderTable(data);
                showMessage('Usuários carregados com sucesso!', 'success');
            })
            .catch(error => {
                showMessage(error.message, 'error');
                console.error('Erro:', error);
            });
    }

    // 2. Obter usuário por ID
    function obterUsuarioPorId() {
        const id = userIdInput.value.trim();
        if (!id) {
            showMessage('Por favor, insira um ID válido', 'error');
            return;
        }

        fetch(`${apiUrl}/${id}`)
            .then(response => {
                if (!response.ok) throw new Error('Usuário não encontrado');
                return response.json();
            })
            .then(data => {
                usuariosTable.innerHTML = '';
                singleUserResult.classList.remove('hidden');
                singleUserResult.innerHTML = `
                    <h3>Detalhes do Usuário (ID: ${data.id})</h3>
                    <p><strong>Nome:</strong> ${data.nome}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Data de Nascimento:</strong> ${new Date(data.dataNascimento).toLocaleDateString('pt-BR')}</p>
                `;
                showMessage('Usuário encontrado com sucesso!', 'success');
            })
            .catch(error => {
                showMessage(error.message, 'error');
                console.error('Erro:', error);
            });
    }

    // 3. Adicionar usuário
    function adicionarUsuario(usuario) {
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(usuario)
        })
        .then(response => {
            if (!response.ok) throw new Error('Erro ao adicionar usuário');
            return response.json();
        })
        .then(data => {
            obterTodosOsUsuarios();
            resetForm();
            showMessage('Usuário adicionado com sucesso!', 'success');
        })
        .catch(error => {
            showMessage(error.message, 'error');
            console.error('Erro:', error);
        });
    }

    // 4. Remover usuário
    function removerUsuario(id) {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

        fetch(`${apiUrl}/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) throw new Error('Erro ao remover usuário');
            obterTodosOsUsuarios();
            if (editingId === id) resetForm();
            showMessage('Usuário removido com sucesso!', 'success');
        })
        .catch(error => {
            showMessage(error.message, 'error');
            console.error('Erro:', error);
        });
    }

    // 5. Editar usuário
    function editarUsuario(id, usuario) {
        fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(usuario)
        })
        .then(response => {
            if (!response.ok) throw new Error('Erro ao atualizar usuário');
            return response.json();
        })
        .then(data => {
            obterTodosOsUsuarios();
            resetForm();
            showMessage('Usuário atualizado com sucesso!', 'success');
        })
        .catch(error => {
            showMessage(error.message, 'error');
            console.error('Erro:', error);
        });
    }

    // Funções auxiliares
    function handleFormSubmit(e) {
        e.preventDefault();

        const usuario = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            dataNascimento: document.getElementById('dataNascimento').value,
            password: document.getElementById('password').value
        };

        if (editingId) {
            editarUsuario(editingId, usuario);
        } else {
            adicionarUsuario(usuario);
        }
    }

    function renderTable(usuarios) {
        usuariosTable.innerHTML = '';
        usuarios.forEach(usuario => {
            const row = usuariosTable.insertRow();
            row.innerHTML = `
                <td>${usuario.id}</td>
                <td>${usuario.nome}</td>
                <td>${usuario.email}</td>
                <td>${new Date(usuario.dataNascimento).toLocaleDateString('pt-BR')}</td>
                <td class="actions">
                    <button class="btn btn-primary" onclick="startEdit(${usuario.id})">Editar</button>
                    <button class="btn btn-danger" onclick="deleteUser(${usuario.id})">Excluir</button>
                </td>
            `;
        });
    }

    function resetForm() {
        editingId = null;
        formTitle.textContent = 'Adicionar Usuário';
        usuarioForm.reset();
    }

    function showMessage(text, type) {
        // Remove mensagens anteriores
        const oldMessages = document.querySelectorAll('.message');
        oldMessages.forEach(msg => msg.remove());

        // Cria nova mensagem
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;

        // Insere antes dos resultados
        document.querySelector('.results').prepend(messageDiv);

        // Remove após 5 segundos
        setTimeout(() => messageDiv.remove(), 5000);
    }

    // Funções globais para os botões na tabela
    window.startEdit = function(id) {
        fetch(`${apiUrl}/${id}`)
            .then(response => response.json())
            .then(data => {
                editingId = id;
                formTitle.textContent = 'Editar Usuário';

                document.getElementById('usuarioId').value = data.id;
                document.getElementById('nome').value = data.nome;
                document.getElementById('email').value = data.email;
                document.getElementById('dataNascimento').value = data.dataNascimento;
                document.getElementById('password').value = data.password;
            })
            .catch(error => {
                showMessage(error.message, 'error');
                console.error('Erro:', error);
            });
    };

    window.deleteUser = function(id) {
        removerUsuario(id);
    };
});