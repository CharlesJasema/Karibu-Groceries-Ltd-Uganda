# Requirements Document: CRUD Operations, Profile Management & Notifications System

## Overview

This requirements document outlines the functional and non-functional requirements for comprehensive system improvements to the KGL Groceries management system. The improvements add five major feature sets derived from the technical design: CRUD operations for records, profile management with photo uploads, real-time notifications, reset/undo functionality, and user distinction/filtering.

## Functional Requirements

### FR1: CRUD Operations for Sales Records

**FR1.1**: The system shall allow managers and agents to edit existing cash sale records
- **FR1.1.1**: Users shall be able to modify produceName, tonnage, amountPaid, paymentMethod, buyerName, salesAgent, date, and time fields
- **FR1.1.2**: The system shall validate all updates against schema constraints before saving
- **FR1.1.3**: The system shall adjust inventory quantities when tonnage is modified
- **FR1.1.4**: The system shall create an audit log entry for each update operation
- **FR1.1.5**: The system shall trigger a notification to managers when a sale is updated

**FR1.2**: The system shall allow managers and agents to delete cash sale records
- **FR1.2.1**: The system shall implement soft delete (set deleted flag to true)
- **FR1.2.2**: The system shall restore inventory quantities when a sale is deleted
- **FR1.2.3**: The system shall record the user who deleted the record and timestamp
- **FR1.2.4**: The system shall create an audit log entry for deletion
- **FR1.2.5**: The system shall trigger a notification to managers when a sale is deleted

**FR1.3**: The system shall allow managers and agents to edit existing credit sale records
- **FR1.3.1**: Users shall be able to modify buyerName, nin, location, contact, amountDue, salesAgent, dueDate, produceName, produceType, tonnage, and dispatchDate fields
- **FR1.3.2**: The system shall validate all updates against schema constraints
- **FR1.3.3**: The system shall adjust inventory quantities when tonnage is modified
- **FR1.3.4**: The system shall create an audit log entry for each update
- **FR1.3.5**: The system shall trigger a notification to managers

**FR1.4**: The system shall allow managers and agents to delete credit sale records
- **FR1.4.1**: The system shall implement soft delete
- **FR1.4.2**: The system shall restore inventory quantities when deleted
- **FR1.4.3**: The system shall record deletion metadata (deletedBy, deletedAt)
- **FR1.4.4**: The system shall create an audit log entry
- **FR1.4.5**: The system shall trigger a notification to managers

**FR1.5**: The system shall provide edit and delete buttons in the UI for each sale record
- **FR1.5.1**: Buttons shall be visible on cash sales table
- **FR1.5.2**: Buttons shall be visible on credit sales table
- **FR1.5.3**: Buttons shall be enabled only for authorized users
- **FR1.5.4**: Edit button shall open a modal/form with current record data
- **FR1.5.5**: Delete button shall show confirmation dialog before deletion

### FR2: CRUD Operations for Procurement Records

**FR2.1**: The system shall allow managers to edit existing procurement records
- **FR2.1.1**: Managers shall be able to modify produceName, produceType, date, time, tonnage, cost, dealerName, branch, contact, and sellingPrice fields
- **FR2.1.2**: The system shall validate all updates against schema constraints
- **FR2.1.3**: The system shall update related inventory records when procurement is modified
- **FR2.1.4**: The system shall create an audit log entry for each update
- **FR2.1.5**: The system shall trigger a notification to other managers

**FR2.2**: The system shall allow managers to delete procurement records
- **FR2.2.1**: The system shall implement soft delete
- **FR2.2.2**: The system shall prevent deletion if inventory has been sold
- **FR2.2.3**: The system shall record deletion metadata
- **FR2.2.4**: The system shall create an audit log entry
- **FR2.2.5**: The system shall trigger a notification to other managers

**FR2.3**: The system shall provide edit and delete buttons in the UI for each procurement record
- **FR2.3.1**: Buttons shall be visible on procurement table
- **FR2.3.2**: Buttons shall be enabled only for managers
- **FR2.3.3**: Edit button shall open a modal/form with current record data
- **FR2.3.4**: Delete button shall show confirmation dialog
- **FR2.3.5**: System shall display error if deletion would cause inventory inconsistency

### FR3: Profile Management

**FR3.1**: The system shall allow users to view their own profile
- **FR3.1.1**: Profile shall display name, username, email, role, branch, contact, location, and photo
- **FR3.1.2**: Profile shall be accessible from user dashboard
- **FR3.1.3**: Profile photo shall display placeholder if no photo uploaded

**FR3.2**: The system shall allow users to edit their own profile information
- **FR3.2.1**: Users shall be able to update name, email, contact, and location fields
- **FR3.2.2**: Users shall not be able to change username, role, or branch
- **FR3.2.3**: The system shall validate email format before saving
- **FR3.2.4**: The system shall validate phone number format before saving
- **FR3.2.5**: The system shall create an audit log entry for profile updates

**FR3.3**: The system shall allow users to upload profile photos
- **FR3.3.1**: System shall accept JPEG, PNG, and GIF file formats only
- **FR3.3.2**: System shall enforce maximum file size of 5MB
- **FR3.3.3**: System shall compress and resize images to 800x800px maximum
- **FR3.3.4**: System shall generate unique filenames to prevent collisions
- **FR3.3.5**: System shall store photos in public/uploads/profiles/ directory
- **FR3.3.6**: System shall delete old photo when new photo is uploaded
- **FR3.3.7**: System shall create an audit log entry for photo uploads

**FR3.4**: The system shall allow users to delete their profile photo
- **FR3.4.1**: System shall remove photo file from storage
- **FR3.4.2**: System shall update user record to remove photo reference
- **FR3.4.3**: System shall display placeholder image after deletion
- **FR3.4.4**: System shall create an audit log entry for photo deletion

**FR3.5**: The system shall allow managers to edit any user profile
- **FR3.5.1**: Managers shall be able to update name, email, contact, location, and branch for any user
- **FR3.5.2**: Managers shall not be able to change username or role
- **FR3.5.3**: System shall create an audit log entry recording which manager made the change
- **FR3.5.4**: System shall trigger a notification to the affected user

**FR3.6**: The system shall provide a profile edit interface in the UI
- **FR3.6.1**: Interface shall display current profile information
- **FR3.6.2**: Interface shall provide form fields for editable information
- **FR3.6.3**: Interface shall provide photo upload button with preview
- **FR3.6.4**: Interface shall show validation errors inline
- **FR3.6.5**: Interface shall display success message after save

### FR4: Notification System

**FR4.1**: The system shall create notifications for record operations
- **FR4.1.1**: System shall create notification when a sale is created
- **FR4.1.2**: System shall create notification when a sale is updated
- **FR4.1.3**: System shall create notification when a sale is deleted
- **FR4.1.4**: System shall create notification when a procurement is created
- **FR4.1.5**: System shall create notification when a procurement is updated
- **FR4.1.6**: System shall create notification when a procurement is deleted

**FR4.2**: The system shall create notifications for user management operations
- **FR4.2.1**: System shall create notification when a new user is created
- **FR4.2.2**: System shall create notification when a user profile is updated by a manager
- **FR4.2.3**: System shall create notification when a user is deactivated

**FR4.3**: The system shall include actor information in notifications
- **FR4.3.1**: Notification shall include the name of the user who performed the action
- **FR4.3.2**: Notification shall include the role of the user who performed the action
- **FR4.3.3**: Notification shall include the timestamp of the action
- **FR4.3.4**: Notification shall include the branch where the action occurred

**FR4.4**: The system shall deliver notifications to appropriate recipients
- **FR4.4.1**: Managers shall receive notifications for all actions in their branch
- **FR4.4.2**: Directors shall receive notifications for all actions across all branches
- **FR4.4.3**: Agents shall not receive notifications (they can view audit logs)

**FR4.5**: The system shall provide a notification center in the UI
- **FR4.5.1**: Notification center shall display list of notifications
- **FR4.5.2**: Notification center shall show unread count badge
- **FR4.5.3**: Notification center shall highlight unread notifications
- **FR4.5.4**: Notification center shall display notification message, actor, and timestamp
- **FR4.5.5**: Notification center shall provide filtering by type and date range

**FR4.6**: The system shall allow users to manage notifications
- **FR4.6.1**: Users shall be able to mark individual notifications as read
- **FR4.6.2**: Users shall be able to mark all notifications as read
- **FR4.6.3**: Users shall be able to delete individual notifications
- **FR4.6.4**: System shall automatically delete read notifications older than 30 days

### FR5: Reset/Undo Functionality

**FR5.1**: The system shall store previous state for all record modifications
- **FR5.1.1**: System shall save previousVersion field when updating a record
- **FR5.1.2**: System shall save previousState in audit log
- **FR5.1.3**: System shall maintain version history for up to 10 modifications per record

**FR5.2**: The system shall allow restoration of deleted records
- **FR5.2.1**: System shall provide restore functionality for soft-deleted records
- **FR5.2.2**: System shall restore inventory quantities when restoring a deleted sale
- **FR5.2.3**: System shall create an audit log entry for restoration
- **FR5.2.4**: System shall trigger a notification when a record is restored

**FR5.3**: The system shall provide undo interface in the UI
- **FR5.3.1**: UI shall show "Restore" button for deleted records
- **FR5.3.2**: UI shall show confirmation dialog before restoration
- **FR5.3.3**: UI shall display success message after restoration
- **FR5.3.4**: UI shall refresh the list view after restoration

### FR6: User Distinction and Filtering

**FR6.1**: The system shall provide user filtering by role
- **FR6.1.1**: System shall allow filtering users by manager role
- **FR6.1.2**: System shall allow filtering users by agent role
- **FR6.1.3**: System shall allow filtering users by director role
- **FR6.1.4**: System shall display user count for each role

**FR6.2**: The system shall provide user filtering by branch
- **FR6.2.1**: System shall allow filtering users by Maganjo branch
- **FR6.2.2**: System shall allow filtering users by Matugga branch
- **FR6.2.3**: System shall display user count for each branch

**FR6.3**: The system shall provide combined filtering
- **FR6.3.1**: System shall allow filtering by both role and branch simultaneously
- **FR6.3.2**: System shall update results dynamically as filters are applied
- **FR6.3.3**: System shall display count of filtered results

**FR6.4**: The system shall provide user search functionality
- **FR6.4.1**: System shall allow searching users by name
- **FR6.4.2**: System shall allow searching users by username
- **FR6.4.3**: System shall allow searching users by email
- **FR6.4.4**: System shall perform case-insensitive search
- **FR6.4.5**: System shall display search results in real-time

**FR6.5**: The system shall provide user statistics dashboard
- **FR6.5.1**: Dashboard shall display total number of users
- **FR6.5.2**: Dashboard shall display count by role (managers, agents, directors)
- **FR6.5.3**: Dashboard shall display count by branch (Maganjo, Matugga)
- **FR6.5.4**: Dashboard shall display count of active vs inactive users

**FR6.6**: The system shall provide user management interface
- **FR6.6.1**: Interface shall display user list with filtering options
- **FR6.6.2**: Interface shall show user cards with photo, name, role, and branch
- **FR6.6.3**: Interface shall provide pagination for large user lists
- **FR6.6.4**: Interface shall provide "View Profile" button for each user
- **FR6.6.5**: Interface shall provide "Edit" button for managers

## Non-Functional Requirements

### NFR1: Performance

**NFR1.1**: The system shall respond to CRUD operations within 500ms under normal load
**NFR1.2**: The system shall handle file uploads up to 5MB within 3 seconds
**NFR1.3**: The system shall load notification list within 300ms
**NFR1.4**: The system shall support pagination with 20 items per page by default
**NFR1.5**: The system shall use database indexes for all filtered queries
**NFR1.6**: The system shall compress uploaded images to reduce storage and bandwidth

### NFR2: Security

**NFR2.1**: The system shall maintain existing JWT-based authentication
**NFR2.2**: The system shall enforce role-based access control for all CRUD operations
**NFR2.3**: The system shall validate all user inputs to prevent XSS attacks
**NFR2.4**: The system shall validate file types using MIME type checking
**NFR2.5**: The system shall prevent directory traversal attacks in file paths
**NFR2.6**: The system shall implement rate limiting on file upload endpoints
**NFR2.7**: The system shall log all CRUD operations with user identity and IP address
**NFR2.8**: The system shall never expose password fields in API responses
**NFR2.9**: The system shall use MongoDB transactions for operations affecting multiple collections

### NFR3: Reliability

**NFR3.1**: The system shall implement soft delete to prevent accidental data loss
**NFR3.2**: The system shall maintain referential integrity across collections
**NFR3.3**: The system shall rollback transactions on error
**NFR3.4**: The system shall handle concurrent modifications with optimistic locking
**NFR3.5**: The system shall continue operation if notification delivery fails (non-critical)
**NFR3.6**: The system shall clean up partial uploads on failure

### NFR4: Usability

**NFR4.1**: The system shall provide clear error messages for validation failures
**NFR4.2**: The system shall display confirmation dialogs for destructive operations
**NFR4.3**: The system shall show success messages after successful operations
**NFR4.4**: The system shall provide inline validation feedback in forms
**NFR4.5**: The system shall display loading indicators during async operations
**NFR4.6**: The system shall maintain responsive design for all new UI components

### NFR5: Maintainability

**NFR5.1**: The system shall maintain existing code structure and patterns
**NFR5.2**: The system shall use consistent naming conventions
**NFR5.3**: The system shall include JSDoc comments for all new functions
**NFR5.4**: The system shall follow existing validation patterns
**NFR5.5**: The system shall maintain backward compatibility with existing API endpoints

### NFR6: Scalability

**NFR6.1**: The system shall support up to 1000 users without performance degradation
**NFR6.2**: The system shall support up to 100,000 records per collection
**NFR6.3**: The system shall implement pagination for all list endpoints
**NFR6.4**: The system shall use efficient database queries with proper indexing
**NFR6.5**: The system shall implement notification cleanup to prevent database bloat

### NFR7: Compatibility

**NFR7.1**: The system shall maintain compatibility with existing frontend (vanilla HTML/CSS/JS)
**NFR7.2**: The system shall maintain compatibility with existing backend (Express.js/MongoDB)
**NFR7.3**: The system shall continue to run on port 3000
**NFR7.4**: The system shall work with MongoDB 6.0 or higher
**NFR7.5**: The system shall work with Node.js 18.0 or higher

## Constraints

### C1: Technical Constraints

**C1.1**: The system must use vanilla JavaScript for frontend (no frameworks)
**C1.2**: The system must use Express.js for backend
**C1.3**: The system must use MongoDB for data storage
**C1.4**: The system must run on port 3000
**C1.5**: The system must use local file storage for photos (no cloud storage)

### C2: Business Constraints

**C2.1**: The system must not break existing functionality
**C2.2**: The system must maintain existing authentication and authorization
**C2.3**: The system must preserve all existing data
**C2.4**: The system must maintain existing API endpoints
**C2.5**: The system must be ready for examination (professional quality)

### C3: Security Constraints

**C3.1**: The system must not expose sensitive user data
**C3.2**: The system must maintain audit trail for all modifications
**C3.3**: The system must implement proper access control
**C3.4**: The system must validate all file uploads
**C3.5**: The system must prevent unauthorized access to records

## Acceptance Criteria

### AC1: CRUD Operations

- [ ] Managers and agents can edit cash sale records through UI
- [ ] Managers and agents can delete cash sale records through UI
- [ ] Managers and agents can edit credit sale records through UI
- [ ] Managers and agents can delete credit sale records through UI
- [ ] Managers can edit procurement records through UI
- [ ] Managers can delete procurement records through UI
- [ ] Inventory is correctly adjusted when records are modified or deleted
- [ ] Audit logs are created for all CRUD operations
- [ ] Notifications are sent to managers for all CRUD operations
- [ ] Deleted records can be restored through UI
- [ ] Edit and delete buttons are visible on all record tables
- [ ] Confirmation dialogs appear before deletion
- [ ] Validation errors are displayed clearly

### AC2: Profile Management

- [ ] Users can view their own profile with all information
- [ ] Users can edit their own profile information (name, email, contact, location)
- [ ] Users can upload profile photos (JPEG, PNG, GIF up to 5MB)
- [ ] Uploaded photos are compressed and resized to 800x800px
- [ ] Users can delete their profile photos
- [ ] Managers can edit any user profile
- [ ] Profile changes create audit log entries
- [ ] Profile updates by managers trigger notifications to affected users
- [ ] Profile edit interface displays current information
- [ ] Validation errors are shown inline in profile form

### AC3: Notification System

- [ ] Notifications are created for all record CRUD operations
- [ ] Notifications are created for user management operations
- [ ] Notifications include actor name, role, and timestamp
- [ ] Managers receive notifications for actions in their branch
- [ ] Directors receive notifications for all actions
- [ ] Notification center displays unread count badge
- [ ] Unread notifications are highlighted
- [ ] Users can mark notifications as read
- [ ] Users can mark all notifications as read
- [ ] Users can delete notifications
- [ ] Notifications can be filtered by type and date
- [ ] Read notifications older than 30 days are auto-deleted

### AC4: User Filtering

- [ ] Users can be filtered by role (manager, agent, director)
- [ ] Users can be filtered by branch (Maganjo, Matugga)
- [ ] Multiple filters can be applied simultaneously
- [ ] Users can be searched by name, username, or email
- [ ] Search is case-insensitive and real-time
- [ ] User statistics dashboard shows counts by role and branch
- [ ] User list displays with pagination (20 per page)
- [ ] User cards show photo, name, role, and branch
- [ ] Filtered results update dynamically

### AC5: System Integration

- [ ] All existing functionality continues to work
- [ ] Existing API endpoints remain functional
- [ ] System runs on port 3000
- [ ] Authentication and authorization work correctly
- [ ] No existing data is lost or corrupted
- [ ] All new features integrate seamlessly with existing UI
- [ ] System passes all existing tests
- [ ] No security vulnerabilities introduced

### AC6: Performance

- [ ] CRUD operations respond within 500ms
- [ ] File uploads complete within 3 seconds for 5MB files
- [ ] Notification list loads within 300ms
- [ ] User filtering responds within 200ms
- [ ] Database queries use proper indexes
- [ ] No N+1 query problems

### AC7: Security

- [ ] Only authorized users can perform CRUD operations
- [ ] File uploads are validated for type and size
- [ ] Directory traversal attacks are prevented
- [ ] All inputs are sanitized
- [ ] Audit logs capture all modifications
- [ ] Passwords are never exposed
- [ ] Transactions maintain data integrity

## Dependencies

### External Dependencies

- **multer** (^1.4.5): File upload handling
- **sharp** (^0.32.0): Image processing and compression
- **mime-types** (^2.1.35): MIME type validation

### Internal Dependencies

- Existing User model and authentication system
- Existing Sale, CreditSale, and Procurement models
- Existing Inventory model and stock management
- Existing AuditLog model
- Existing role-based access control middleware
- Existing validation middleware

## Risks and Mitigation

### Risk 1: Data Integrity Issues

**Risk**: Modifying or deleting records could cause inventory inconsistencies
**Impact**: High - Could lead to incorrect stock levels
**Mitigation**: 
- Use MongoDB transactions for all operations affecting multiple collections
- Implement validation to prevent operations that would cause negative inventory
- Maintain audit trail for all changes
- Implement restore functionality for accidental deletions

### Risk 2: File Upload Vulnerabilities

**Risk**: Malicious file uploads could compromise system security
**Impact**: High - Could lead to code execution or data breach
**Mitigation**:
- Validate file types using MIME type checking
- Enforce strict file size limits
- Generate random filenames
- Store files with proper access controls
- Implement rate limiting on upload endpoints

### Risk 3: Performance Degradation

**Risk**: New features could slow down existing functionality
**Impact**: Medium - Could affect user experience
**Mitigation**:
- Implement proper database indexing
- Use pagination for all list views
- Optimize queries with projection and lean()
- Implement caching where appropriate
- Monitor performance metrics

### Risk 4: Breaking Existing Functionality

**Risk**: New code could introduce bugs in existing features
**Impact**: High - Could disrupt business operations
**Mitigation**:
- Maintain existing code patterns and structure
- Write comprehensive tests for new features
- Perform thorough integration testing
- Use feature flags for gradual rollout
- Maintain backward compatibility

### Risk 5: Notification Overload

**Risk**: Too many notifications could overwhelm managers
**Impact**: Low - Could reduce notification effectiveness
**Mitigation**:
- Implement notification filtering and search
- Auto-delete old read notifications
- Batch similar notifications
- Allow users to configure notification preferences (future)

## Success Metrics

### Metric 1: Feature Adoption

- 80% of managers use CRUD operations within first month
- 60% of users upload profile photos within first month
- 90% of managers check notifications daily

### Metric 2: System Performance

- 95% of CRUD operations complete within 500ms
- 99% of file uploads complete within 3 seconds
- Zero data integrity issues reported

### Metric 3: User Satisfaction

- Positive feedback from managers on CRUD functionality
- Reduced time to update records (measured via audit logs)
- Reduced support requests for profile updates

### Metric 4: System Reliability

- 99.9% uptime maintained
- Zero data loss incidents
- All audit trails complete and accurate

## Glossary

- **CRUD**: Create, Read, Update, Delete operations
- **Soft Delete**: Marking a record as deleted without removing it from database
- **Audit Log**: Record of all system modifications with user and timestamp
- **Notification**: Alert message sent to users about system events
- **Profile Photo**: User-uploaded image displayed on their profile
- **Inventory**: Stock levels of produce items
- **Transaction**: Database operation that ensures data consistency
- **JWT**: JSON Web Token used for authentication
- **MIME Type**: File format identifier
- **Pagination**: Dividing large result sets into pages
