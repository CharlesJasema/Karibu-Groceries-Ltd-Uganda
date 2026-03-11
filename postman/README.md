# KGL Groceries API - Postman Collection

This directory contains Postman collection and environment files for testing the KGL Groceries Management System API.

## 📁 Files Included

- **`KGL-Groceries-API.postman_collection.json`** - Complete API collection with all endpoints
- **`KGL-Development.postman_environment.json`** - Development environment variables
- **`KGL-Production.postman_environment.json`** - Production environment template

## 🚀 Quick Setup

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select `KGL-Groceries-API.postman_collection.json`
4. Collection will be imported with all endpoints organized by category

### 2. Import Environment
1. In Postman, go to **Environments** tab
2. Click **Import**
3. Select `KGL-Development.postman_environment.json`
4. Set as active environment

### 3. First Test - Login
1. Go to **Authentication > Login** request
2. Update credentials in request body if needed:
   ```json
   {
       "username": "manager",
       "password": "Manager@2026",
       "role": "manager",
       "branch": "Maganjo"
   }
   ```
3. Send request
4. Token will be automatically saved to environment variables

### 4. Test Other Endpoints
- All other requests will automatically use the saved token
- Environment variables are automatically populated after login

## 📋 Collection Structure

### 🔐 Authentication
- **Login** - Get JWT token (auto-saves to environment)
- **Forgot Password** - Request password reset OTP
- **Reset Password** - Reset password with OTP

### 👥 User Management
- **Get All Users** - List all users (Manager/Director only)
- **Create User** - Add new user (Manager only)
- **Update User** - Modify user information
- **Activate/Deactivate User** - Manage user status

### 💰 Sales Management
- **Record Cash Sale** - Create immediate payment sale (Agent only)
- **Get Cash Sales** - List all cash sales with pagination
- **Record Credit Sale** - Create deferred payment sale (Agent only)
- **Get Credit Sales** - List credit sales with filters
- **Mark Credit as Paid** - Update credit sale status
- **Get Inventory** - View current stock levels

### 💳 Payment Management
- **Record Payment** - Log payment for sales
- **Get All Payments** - List payments with pagination
- **Get Payment Statistics** - Payment analytics by method/branch

### 📦 Procurement Management
- **Record Procurement** - Add new stock (Manager only)
- **Get All Procurements** - List procurement records

### 📊 Reports & Analytics
- **Get Summary Report** - Enterprise overview (Director only)
- **Get Branch Report** - Branch-specific analytics
- **Get Stock Report** - Inventory status report

### 👤 Profile Management
- **Get My Profile** - Current user information
- **Update Profile** - Modify profile details
- **Change Password** - Update user password

### 📋 Audit & Notifications
- **Get Audit Logs** - System activity logs (Manager/Director)
- **Get Notifications** - User notifications
- **Mark Notification as Read** - Update notification status

### 🏥 System Health
- **Health Check** - System status and database connectivity
- **API Documentation** - Access Swagger docs

## 🔧 Environment Variables

The collection uses these environment variables:

| Variable | Description | Auto-Set |
|----------|-------------|----------|
| `base_url` | API server URL | Manual |
| `token` | JWT authentication token | ✅ After login |
| `user_id` | Current user ID | ✅ After login |
| `user_role` | Current user role | ✅ After login |
| `user_branch` | Current user branch | ✅ After login |
| `sale_id` | Sale ID for testing | Manual |
| `credit_sale_id` | Credit sale ID for testing | Manual |
| `notification_id` | Notification ID for testing | Manual |

## 🎯 Testing Workflows

### Complete Sales Flow Test
1. **Login** as manager or agent
2. **Record Cash Sale** - Create a sale
3. **Get Cash Sales** - Verify sale appears
4. **Record Payment** - Log payment for the sale
5. **Get All Payments** - Verify payment recorded

### User Management Flow
1. **Login** as manager
2. **Create User** - Add new agent
3. **Get All Users** - Verify user created
4. **Update User** - Modify user details
5. **Activate/Deactivate User** - Test status changes

### Credit Sales Flow
1. **Login** as agent
2. **Record Credit Sale** - Create credit transaction
3. **Get Credit Sales** - View unpaid credits
4. **Mark Credit as Paid** - Update payment status
5. **Get Credit Sales** - Verify status change

## 🔒 Security Notes

### Safe for GitHub ✅
- **No real credentials** - Uses placeholder passwords
- **No API keys** - Environment variables are empty by default
- **No sensitive data** - All examples use test data

### Production Usage
1. Update `KGL-Production.postman_environment.json`:
   - Set correct `base_url`
   - Use real production credentials
2. **Never commit** production credentials to version control
3. Use Postman's secure variable storage for sensitive data

## 🐛 Troubleshooting

### Common Issues

**❌ 401 Unauthorized**
- Solution: Run the Login request first to get a valid token

**❌ 403 Forbidden**
- Solution: Check user role permissions (some endpoints require Manager/Director)

**❌ Connection Error**
- Solution: Verify server is running and `base_url` is correct

**❌ Token Expired**
- Solution: Run Login request again to get a fresh token

### Debug Tips
1. Check **Console** tab in Postman for detailed logs
2. Verify environment variables are set correctly
3. Ensure server is running on the specified port
4. Check request body format matches API expectations

## 📚 Additional Resources

- **API Documentation**: Visit `{{base_url}}/api-docs` for Swagger docs
- **Health Check**: Use `{{base_url}}/health` to verify server status
- **Repository**: See main README.md for setup instructions

## 🤝 Support

For issues with the Postman collection:
1. Check this README for common solutions
2. Verify server is running and accessible
3. Review API documentation at `/api-docs`
4. Check server logs for detailed error information

---

**Happy Testing! 🚀**