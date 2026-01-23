# 后台管理系统配置说明

## 密码登录配置

后台支持两种登录方式：
1. **Token 登录**：直接输入 GitHub Personal Access Token
2. **密码登录**：输入预设密码，自动使用配置的 Token 登录

### 配置步骤

1. **生成 GitHub Token**
   - 访问 https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 勾选 `repo` 权限
   - 生成并复制 Token

2. **生成密码哈希**
   - 打开浏览器控制台（F12）
   - 输入以下代码（将 `your-password` 替换为你想设置的密码）：
   ```javascript
   (async () => {
     const password = 'your-password';
     const encoder = new TextEncoder();
     const data = encoder.encode(password);
     const hash = await crypto.subtle.digest('SHA-256', data);
     const hashHex = Array.from(new Uint8Array(hash))
       .map(b => b.toString(16).padStart(2, '0'))
       .join('');
     console.log('密码哈希:', hashHex);
   })();
   ```
   - 复制输出的哈希值

3. **修改配置**
   - 编辑 `public/admin/index.html`
   - 找到 `PASSWORD_CONFIG` 对象
   - 替换 `passwordHash` 为你生成的哈希值
   - 替换 `token` 为你的 GitHub Token

### 示例配置

```javascript
const PASSWORD_CONFIG = {
  // 密码 "mypassword123" 的哈希值
  passwordHash: 'abc123def456...',
  // 你的 GitHub Token
  token: 'ghp_xxxxxxxxxxxxxxxxxxxx'
};
```

### 安全提示

- 不要在公开的代码仓库中直接暴露 Token
- 定期更换密码和 Token
- 使用强密码
- Token 只授予必要的权限

### 默认密码

当前默认密码是：`admin123`（仅用于测试，请立即修改！）
