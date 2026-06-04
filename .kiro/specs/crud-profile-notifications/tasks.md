# Implementation Tasks: CRUD Operations, Profile Management & Notifications System

## Task Overview

This document breaks down the implementation of the comprehensive system improvements into manageable tasks. Tasks are organized by feature area and prioritized for sequential implementation.

## Task 1: Setup and Dependencies

**Status**: pending
**Priority**: high
**Estimated Effort**: 1 hour

**Description**: Install required npm packages and create directory structure for new features

**Subtasks**:
1. Install multer for file upload handling
2. Install sharp for image processing
3. Install mime-types for MIME validation
4. Create public/uploads/profiles/ directory for profile photos
5. Update .gitignore to exclude uploaded files from version control
6. Verify all dependencies are properly installed

**Acceptance Criteria**:
- [ ] All npm packages installed successfully
- [ ] Directory structure created
- [ ] .gitignore updated
- [ ] No dependency conflicts

**Files to Modify**:
- package.json
- .gitignore

**Files to Create**:
- public/uploads/profiles/.gitkeep


## Task 2: Enhance Data Models

**Status**: pending
**Priority**: high
**Estimated Effort**: 2 hours

**Description**: Update existing models to support soft delete, versioning, and new fields

**Subtasks**:
1. Add deleted, deletedAt, deletedBy, previousVersion fields to Sale model
2. Add deleted, deletedAt, deletedBy, previousVersion fields to CreditSale model
3. Add deleted, deletedAt, deletedBy, previousVersion fields to Procurement model
4. Add location and photo fields to User model
5. Add previousState and newState fields to AuditLog model
6. Add database indexes for new fields
7. Test model updates with sample data

**Acceptance Criteria**:
- [ ] All models updated with new fields
- [ ] Database indexes created
- [ ] Existing data remains intact
- [ ] Models pass validation tests

**Files to Modify**:
- models/user.js
- models/sale.js
- models/creditSale.js
- models/procurement.js
- models/auditLog.js


## Task 3: Create Notification Model

**Status**: pending
**Priority**: high
**Estimated Effort**: 1 hour

**Description**: Create new Notification model for tracking system events

**Subtasks**:
1. Create models/notification.js with schema
2. Define NotificationType enum
3. Add validation rules
4. Create database indexes for efficient queries
5. Add helper methods for notification management
6. Test notification model creation

**Acceptance Criteria**:
- [ ] Notification model created with all required fields
- [ ] Indexes created for recipient, read status, and createdAt
- [ ] Model validates notification types correctly
- [ ] Helper methods work as expected

**Files to Create**:
- models/notification.js


## Task 4: Create Notification Service

**Status**: pending
**Priority**: high
**Estimated Effort**: 2 hours

**Description**: Implement notification engine service for creating and managing notifications

**Subtasks**:
1. Create services/notificationService.js
2. Implement createNotification function
3. Implement getNotifications with filtering
4. Implement markAsRead and markAllAsRead functions
5. Implement getUnreadCount function
6. Implement deleteNotification function
7. Add error handling and logging
8. Test all service functions

**Acceptance Criteria**:
- [ ] Notification service created with all functions
- [ ] Notifications are created correctly
- [ ] Filtering works by branch, type, and date
- [ ] Read/unread status updates correctly
- [ ] Error handling is robust

**Files to Create**:
- services/notificationService.js


## Task 5: Create File Upload Middleware

**Status**: pending
**Priority**: high
**Estimated Effort**: 2 hours

**Description**: Implement secure file upload handling with validation and image processing

**Subtasks**:
1. Create middleware/fileUpload.js
2. Configure multer for profile photo uploads
3. Implement file type validation using MIME types
4. Implement file size validation (5MB max)
5. Implement image compression and resizing with sharp
6. Implement unique filename generation
7. Implement old file cleanup function
8. Add error handling for upload failures
9. Test file upload with various file types and sizes

**Acceptance Criteria**:
- [ ] File upload middleware created
- [ ] Only JPEG, PNG, GIF files accepted
- [ ] Files larger than 5MB rejected
- [ ] Images compressed and resized to 800x800px
- [ ] Unique filenames generated
- [ ] Old photos deleted when replaced
- [ ] Error messages are clear

**Files to Create**:
- middleware/fileUpload.js


## Task 6: Update Sales Routes for CRUD Operations

**Status**: pending
**Priority**: high
**Estimated Effort**: 3 hours

**Description**: Add update and delete endpoints for cash and credit sales

**Subtasks**:
1. Add PUT /sales/cash/:id endpoint for updating cash sales
2. Add DELETE /sales/cash/:id endpoint for soft deleting cash sales
3. Add POST /sales/cash/:id/restore endpoint for restoring deleted sales
4. Add PUT /sales/credit/:id endpoint for updating credit sales
5. Add DELETE /sales/credit/:id endpoint for soft deleting credit sales
6. Add POST /sales/credit/:id/restore endpoint for restoring deleted credit sales
7. Implement inventory adjustment logic for updates and deletes
8. Implement authorization checks (managers and agents)
9. Integrate notification service for all operations
10. Add validation for all update requests
11. Test all endpoints with Postman

**Acceptance Criteria**:
- [ ] All CRUD endpoints implemented
- [ ] Inventory adjusts correctly on update/delete
- [ ] Soft delete implemented (deleted flag)
- [ ] Restore functionality works
- [ ] Notifications sent to managers
- [ ] Audit logs created for all operations
- [ ] Authorization enforced correctly
- [ ] Validation prevents invalid updates

**Files to Modify**:
- routes/salesRoutes.js


## Task 7: Update Procurement Routes for CRUD Operations

**Status**: pending
**Priority**: high
**Estimated Effort**: 2 hours

**Description**: Add update and delete endpoints for procurement records

**Subtasks**:
1. Add PUT /procurement/:id endpoint for updating procurement
2. Add DELETE /procurement/:id endpoint for soft deleting procurement
3. Add POST /procurement/:id/restore endpoint for restoring deleted procurement
4. Implement inventory update logic when procurement is modified
5. Implement validation to prevent deletion if inventory has been sold
6. Implement authorization checks (managers only)
7. Integrate notification service
8. Test all endpoints with Postman

**Acceptance Criteria**:
- [ ] All CRUD endpoints implemented
- [ ] Inventory updates correctly
- [ ] Cannot delete if inventory sold
- [ ] Soft delete implemented
- [ ] Restore functionality works
- [ ] Notifications sent to managers
- [ ] Audit logs created
- [ ] Only managers can perform operations

**Files to Modify**:
- routes/procurementRoutes.js


## Task 8: Create Profile Management Routes

**Status**: pending
**Priority**: high
**Estimated Effort**: 3 hours

**Description**: Create new routes for profile management and photo uploads

**Subtasks**:
1. Create routes/profileRoutes.js
2. Add GET /profile/:id endpoint to view any user profile
3. Add PUT /profile/me endpoint for users to update own profile
4. Add PUT /profile/:id endpoint for managers to update any profile
5. Add POST /profile/me/photo endpoint for photo upload
6. Add DELETE /profile/me/photo endpoint for photo deletion
7. Integrate file upload middleware
8. Implement authorization checks
9. Integrate notification service for manager updates
10. Add validation for profile updates
11. Mount routes in server.js
12. Test all endpoints with Postman

**Acceptance Criteria**:
- [ ] All profile endpoints implemented
- [ ] Users can update own profiles
- [ ] Managers can update any profile
- [ ] Photo upload works with validation
- [ ] Photo deletion works
- [ ] Old photos cleaned up
- [ ] Notifications sent when manager updates profile
- [ ] Audit logs created
- [ ] Validation enforced

**Files to Create**:
- routes/profileRoutes.js

**Files to Modify**:
- server.js


## Task 9: Create Notification Routes

**Status**: pending
**Priority**: high
**Estimated Effort**: 2 hours

**Description**: Create API endpoints for notification management

**Subtasks**:
1. Create routes/notificationRoutes.js
2. Add GET /notifications endpoint with filtering
3. Add GET /notifications/unread/count endpoint
4. Add PATCH /notifications/:id/read endpoint
5. Add PATCH /notifications/read-all endpoint
6. Add DELETE /notifications/:id endpoint
7. Implement authorization (users can only access own notifications)
8. Add pagination support
9. Mount routes in server.js
10. Test all endpoints with Postman

**Acceptance Criteria**:
- [ ] All notification endpoints implemented
- [ ] Filtering works by type, branch, date
- [ ] Pagination works correctly
- [ ] Unread count accurate
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Delete works
- [ ] Authorization enforced

**Files to Create**:
- routes/notificationRoutes.js

**Files to Modify**:
- server.js


## Task 10: Update User Routes for Filtering

**Status**: pending
**Priority**: medium
**Estimated Effort**: 2 hours

**Description**: Enhance user listing endpoint with advanced filtering and search

**Subtasks**:
1. Update GET /users endpoint to support role filter
2. Add branch filter support
3. Add search query support (name, username, email)
4. Add combined filtering (role + branch)
5. Add user statistics endpoint GET /users/stats
6. Implement pagination
7. Test filtering with various combinations

**Acceptance Criteria**:
- [ ] Filter by role works
- [ ] Filter by branch works
- [ ] Combined filters work
- [ ] Search works (case-insensitive)
- [ ] Statistics endpoint returns correct counts
- [ ] Pagination works
- [ ] Results update dynamically

**Files to Modify**:
- routes/userRoutes.js


## Task 11: Update Cash Sales Frontend UI

**Status**: pending
**Priority**: high
**Estimated Effort**: 3 hours

**Description**: Add edit and delete functionality to cash sales page

**Subtasks**:
1. Add Edit and Delete buttons to cash sales table
2. Create edit modal with form pre-filled with current data
3. Implement form validation in edit modal
4. Add delete confirmation dialog
5. Implement API calls for update and delete
6. Add restore button for deleted records
7. Update table to hide deleted records by default
8. Add "Show Deleted" toggle option
9. Add success/error message display
10. Test all UI interactions

**Acceptance Criteria**:
- [ ] Edit button opens modal with current data
- [ ] Edit form validates input
- [ ] Update API call works
- [ ] Delete button shows confirmation
- [ ] Delete API call works
- [ ] Deleted records hidden by default
- [ ] Restore button appears for deleted records
- [ ] Success messages displayed
- [ ] Error messages displayed clearly
- [ ] Table refreshes after operations

**Files to Modify**:
- public/salesAgent/cash-sales.html
- public/manager/sales.html


## Task 12: Update Credit Sales Frontend UI

**Status**: pending
**Priority**: high
**Estimated Effort**: 3 hours

**Description**: Add edit and delete functionality to credit sales page

**Subtasks**:
1. Add Edit and Delete buttons to credit sales table
2. Create edit modal with form pre-filled with current data
3. Implement form validation in edit modal
4. Add delete confirmation dialog
5. Implement API calls for update and delete
6. Add restore button for deleted records
7. Update table to hide deleted records by default
8. Add "Show Deleted" toggle option
9. Add success/error message display
10. Test all UI interactions

**Acceptance Criteria**:
- [ ] Edit button opens modal with current data
- [ ] Edit form validates input
- [ ] Update API call works
- [ ] Delete button shows confirmation
- [ ] Delete API call works
- [ ] Deleted records hidden by default
- [ ] Restore button appears for deleted records
- [ ] Success messages displayed
- [ ] Error messages displayed clearly
- [ ] Table refreshes after operations

**Files to Modify**:
- public/salesAgent/credit-sales.html (if exists)
- public/manager/sales.html


## Task 13: Update Procurement Frontend UI

**Status**: pending
**Priority**: high
**Estimated Effort**: 3 hours

**Description**: Add edit and delete functionality to procurement page

**Subtasks**:
1. Add Edit and Delete buttons to procurement table
2. Create edit modal with form pre-filled with current data
3. Implement form validation in edit modal
4. Add delete confirmation dialog with inventory check warning
5. Implement API calls for update and delete
6. Add restore button for deleted records
7. Update table to hide deleted records by default
8. Add "Show Deleted" toggle option
9. Add success/error message display
10. Test all UI interactions

**Acceptance Criteria**:
- [ ] Edit button opens modal with current data
- [ ] Edit form validates input
- [ ] Update API call works
- [ ] Delete button shows confirmation with warning
- [ ] Delete API call works
- [ ] Error shown if deletion would cause inventory issue
- [ ] Deleted records hidden by default
- [ ] Restore button appears for deleted records
- [ ] Success messages displayed
- [ ] Table refreshes after operations

**Files to Modify**:
- public/manager/procurement.html


## Task 14: Create Profile Management Frontend UI

**Status**: pending
**Priority**: high
**Estimated Effort**: 4 hours

**Description**: Create profile view and edit pages for users

**Subtasks**:
1. Create public/profile/view-profile.html
2. Add profile display with photo, name, username, email, role, branch, contact, location
3. Add "Edit Profile" button
4. Create public/profile/edit-profile.html
5. Add profile edit form with all editable fields
6. Add photo upload with preview
7. Add photo delete button
8. Implement form validation
9. Implement API calls for profile update and photo upload
10. Add success/error message display
11. Add navigation links from dashboards
12. Test all profile interactions

**Acceptance Criteria**:
- [ ] Profile view page displays all user information
- [ ] Profile photo displays or shows placeholder
- [ ] Edit profile page pre-fills current data
- [ ] Photo upload works with preview
- [ ] Photo upload validates file type and size
- [ ] Photo delete works
- [ ] Profile update API call works
- [ ] Validation errors displayed inline
- [ ] Success messages displayed
- [ ] Navigation works from dashboards

**Files to Create**:
- public/profile/view-profile.html
- public/profile/edit-profile.html

**Files to Modify**:
- public/manager/manager-dashboard.html
- public/salesAgent/agent-dashboard.html


## Task 15: Create Notification Center Frontend UI

**Status**: pending
**Priority**: high
**Estimated Effort**: 4 hours

**Description**: Create notification center for managers and directors

**Subtasks**:
1. Create public/notifications/notification-center.html
2. Add notification list with filtering options
3. Add unread count badge in navigation
4. Implement notification display with actor, message, timestamp
5. Add mark as read functionality
6. Add mark all as read button
7. Add delete notification functionality
8. Add filter by type dropdown
9. Add filter by date range
10. Implement pagination
11. Add real-time notification check (polling every 30 seconds)
12. Add notification icon to manager and director dashboards
13. Test all notification interactions

**Acceptance Criteria**:
- [ ] Notification center displays all notifications
- [ ] Unread notifications highlighted
- [ ] Unread count badge shows correct number
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Delete notification works
- [ ] Filtering by type works
- [ ] Filtering by date works
- [ ] Pagination works
- [ ] Notifications update automatically
- [ ] Navigation from dashboards works

**Files to Create**:
- public/notifications/notification-center.html

**Files to Modify**:
- public/manager/manager-dashboard.html
- public/director/director-dashboard.html (if exists)


## Task 16: Create User Management Frontend UI

**Status**: pending
**Priority**: medium
**Estimated Effort**: 4 hours

**Description**: Create user management page with filtering and search for managers

**Subtasks**:
1. Create public/manager/user-management.html
2. Add user statistics dashboard (counts by role and branch)
3. Add filter by role dropdown
4. Add filter by branch dropdown
5. Add search input for name/username/email
6. Add user cards display with photo, name, role, branch
7. Add "View Profile" button for each user
8. Add "Edit Profile" button for managers
9. Implement pagination
10. Add navigation link from manager dashboard
11. Test all filtering and search combinations

**Acceptance Criteria**:
- [ ] User statistics display correctly
- [ ] Filter by role works
- [ ] Filter by branch works
- [ ] Combined filters work
- [ ] Search works in real-time
- [ ] User cards display all information
- [ ] Profile photos display or show placeholder
- [ ] View profile button works
- [ ] Edit profile button works (managers only)
- [ ] Pagination works
- [ ] Navigation from dashboard works

**Files to Create**:
- public/manager/user-management.html

**Files to Modify**:
- public/manager/manager-dashboard.html


## Task 17: Update Postman Collection

**Status**: pending
**Priority**: medium
**Estimated Effort**: 1 hour

**Description**: Add all new API endpoints to Postman collection

**Subtasks**:
1. Add PUT /sales/cash/:id endpoint
2. Add DELETE /sales/cash/:id endpoint
3. Add POST /sales/cash/:id/restore endpoint
4. Add PUT /sales/credit/:id endpoint
5. Add DELETE /sales/credit/:id endpoint
6. Add POST /sales/credit/:id/restore endpoint
7. Add PUT /procurement/:id endpoint
8. Add DELETE /procurement/:id endpoint
9. Add POST /procurement/:id/restore endpoint
10. Add all profile management endpoints
11. Add all notification endpoints
12. Add user filtering and statistics endpoints
13. Add example request bodies for all endpoints
14. Test all endpoints in Postman

**Acceptance Criteria**:
- [ ] All new endpoints added to collection
- [ ] Example request bodies provided
- [ ] All endpoints tested and working
- [ ] Collection exported and saved

**Files to Modify**:
- KGL_Working_Collection.json


## Task 18: Write Unit Tests

**Status**: pending
**Priority**: medium
**Estimated Effort**: 4 hours

**Description**: Write comprehensive unit tests for all new functionality

**Subtasks**:
1. Create test/models/notification.test.js
2. Create test/services/notificationService.test.js
3. Create test/middleware/fileUpload.test.js
4. Create test/routes/salesRoutes.test.js (CRUD operations)
5. Create test/routes/procurementRoutes.test.js (CRUD operations)
6. Create test/routes/profileRoutes.test.js
7. Create test/routes/notificationRoutes.test.js
8. Test all validation rules
9. Test authorization checks
10. Test error handling
11. Run all tests and ensure 80%+ coverage

**Acceptance Criteria**:
- [ ] All test files created
- [ ] Tests cover happy paths
- [ ] Tests cover error scenarios
- [ ] Tests cover authorization
- [ ] Tests cover validation
- [ ] All tests pass
- [ ] Code coverage >= 80%

**Files to Create**:
- test/models/notification.test.js
- test/services/notificationService.test.js
- test/middleware/fileUpload.test.js
- test/routes/salesRoutes.test.js
- test/routes/procurementRoutes.test.js
- test/routes/profileRoutes.test.js
- test/routes/notificationRoutes.test.js


## Task 19: Integration Testing

**Status**: pending
**Priority**: medium
**Estimated Effort**: 3 hours

**Description**: Perform end-to-end integration testing of all features

**Subtasks**:
1. Test complete CRUD flow for cash sales
2. Test complete CRUD flow for credit sales
3. Test complete CRUD flow for procurement
4. Test profile management flow
5. Test notification delivery flow
6. Test user filtering and search
7. Test inventory consistency across operations
8. Test authorization for all operations
9. Test concurrent modifications
10. Document any issues found

**Acceptance Criteria**:
- [ ] All CRUD operations work end-to-end
- [ ] Profile management works end-to-end
- [ ] Notifications delivered correctly
- [ ] User filtering works correctly
- [ ] Inventory remains consistent
- [ ] Authorization enforced properly
- [ ] No data integrity issues
- [ ] All issues documented and resolved


## Task 20: Documentation and Cleanup

**Status**: pending
**Priority**: low
**Estimated Effort**: 2 hours

**Description**: Update documentation and clean up code

**Subtasks**:
1. Update ALL_API_ENDPOINTS.md with new endpoints
2. Create FEATURE_GUIDE.md explaining new features
3. Update README.md with new features
4. Add JSDoc comments to all new functions
5. Remove any console.log statements
6. Format code consistently
7. Update .env.example if needed
8. Create migration guide for existing data

**Acceptance Criteria**:
- [ ] All documentation updated
- [ ] JSDoc comments added
- [ ] Code formatted consistently
- [ ] No debug statements left
- [ ] Migration guide created
- [ ] README reflects new features

**Files to Modify**:
- ALL_API_ENDPOINTS.md
- README.md
- .env.example

**Files to Create**:
- FEATURE_GUIDE.md
- MIGRATION_GUIDE.md

## Implementation Order

The tasks should be implemented in the following order:

1. **Phase 1: Backend Foundation** (Tasks 1-5)
   - Setup dependencies
   - Enhance data models
   - Create notification model and service
   - Create file upload middleware

2. **Phase 2: Backend API** (Tasks 6-10)
   - Update sales routes for CRUD
   - Update procurement routes for CRUD
   - Create profile management routes
   - Create notification routes
   - Update user routes for filtering

3. **Phase 3: Frontend UI** (Tasks 11-16)
   - Update cash sales UI
   - Update credit sales UI
   - Update procurement UI
   - Create profile management UI
   - Create notification center UI
   - Create user management UI

4. **Phase 4: Testing and Documentation** (Tasks 17-20)
   - Update Postman collection
   - Write unit tests
   - Perform integration testing
   - Update documentation

## Estimated Total Effort

- Phase 1: 8 hours
- Phase 2: 12 hours
- Phase 3: 21 hours
- Phase 4: 10 hours

**Total: 51 hours** (approximately 6-7 working days)

## Notes

- Each task should be completed and tested before moving to the next
- Commit code after each task completion
- Run existing tests after each task to ensure no regressions
- Keep the server running on port 3000 throughout development
- Test with existing demo users (manager, agent, director)
- Maintain backward compatibility with existing functionality
