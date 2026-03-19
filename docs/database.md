# 数据库结构说明

数据库结构由 **TypeORM 实体** 定义，后端启动时若配置了 `synchronize: true`，会自动建表/同步，**无需手写建表 SQL**。

---

## 实体文件位置（即“数据库结构”所在）

| 表名 | 实体文件路径 |
|------|--------------|
| `group_binding` | `backend/src/group-binding/entities/group-binding.entity.ts` |
| `conversation_message` | `backend/src/session/entities/conversation-message.entity.ts` |

---

## 表结构（等价 SQL，供参考或手动建库）

你只需要在 MySQL 里**先建一个空库**（如 `ai_customer_service`），表由后端自动创建。若需手动建表，可执行下面 SQL：

```sql
-- 库需先创建： CREATE DATABASE ai_customer_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ai_customer_service;

CREATE TABLE IF NOT EXISTS `group_binding` (
  `id` int NOT NULL AUTO_INCREMENT,
  `wecomChatId` varchar(128) NOT NULL,
  `chatType` varchar(16) NOT NULL DEFAULT 'group',
  `botId` varchar(64) NOT NULL,
  `enabled` tinyint NOT NULL DEFAULT 1,
  `remark` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_wecomChatId` (`wecomChatId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `conversation_message` (
  `id` int NOT NULL AUTO_INCREMENT,
  `wecomChatId` varchar(128) NOT NULL,
  `wecomUserId` varchar(128) NOT NULL,
  `cozeConversationId` varchar(128) DEFAULT NULL,
  `role` varchar(32) NOT NULL,
  `content` text NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_wecomChatId_wecomUserId` (`wecomChatId`, `wecomUserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 字段说明

**group_binding（群/会话与 Bot 绑定）**

- `wecomChatId`：企业微信群 chatid 或单聊标识  
- `chatType`：`group` / `single`  
- `botId`：扣子 Bot ID  
- `enabled`：是否启用  
- `remark`：备注  

**conversation_message（会话消息记录）**

- `wecomChatId` / `wecomUserId`：企微会话与用户  
- `cozeConversationId`：扣子会话 ID（多轮上下文）  
- `role`：`user` / `assistant`  
- `content`：消息内容  
