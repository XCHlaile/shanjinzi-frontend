// Generated from docs/api/openapi.json. Do not edit by hand.
export interface OpenApiSchemas {
  "PublicSchoolListResponse": {
    "id"?: number
    "name"?: string
    "address"?: string
    "contactName"?: string
    "contactPhone"?: string
    "logoFileId"?: number
    "description"?: string
    "status"?: string
    "createdAt"?: string
    "updatedAt"?: string
  }
  "PageResponsePublicSchoolListResponse": {
    "items"?: Array<OpenApiSchemas["PublicSchoolListResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponsePublicSchoolListResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponsePublicSchoolListResponse"]
    "traceId"?: string
  }
  "PublicSchoolDetailResponse": {
    "id"?: number
    "name"?: string
    "address"?: string
    "contactName"?: string
    "contactPhone"?: string
    "logoFileId"?: number
    "description"?: string
    "status"?: string
    "createdAt"?: string
    "updatedAt"?: string
  }
  "ApiResponsePublicSchoolDetailResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PublicSchoolDetailResponse"]
    "traceId"?: string
  }
  "AdminSchoolCreateRequest": {
    "name": string
    "address"?: string
    "contactName"?: string
    "contactPhone"?: string
    "logoFileId"?: number
    "description"?: string
  }
  "AdminSchoolUpdateRequest": {
    "name"?: string
    "address"?: string
    "contactName"?: string
    "contactPhone"?: string
    "logoFileId"?: number
    "description"?: string
  }
  "AdminSchoolOverviewResponse": {
    "teacherCount"?: number
    "parentCount"?: number
    "classCount"?: number
    "competitionCount"?: number
    "registrationCount"?: number
  }
  "ApiResponseAdminSchoolOverviewResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["AdminSchoolOverviewResponse"]
    "traceId"?: string
  }
  "PublicClassDetailResponse": {
    "id"?: number
    "schoolId"?: number
    "name"?: string
    "gradeName"?: string
    "sortOrder"?: number
    "status"?: string
    "createdAt"?: string
    "updatedAt"?: string
  }
  "ApiResponsePublicClassDetailResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PublicClassDetailResponse"]
    "traceId"?: string
  }
  "PublicClassCreateRequest": {
    "name": string
    "gradeName"?: string
    "sortOrder"?: number
    "schoolId"?: number
  }
  "PublicClassUpdateRequest": {
    "name"?: string
    "gradeName"?: string
    "sortOrder"?: number
  }
  "ApiResponseVoid": {
    "code"?: string
    "message"?: string
    "data"?: null
    "traceId"?: string
  }
  "PublicClassListResponse": {
    "id"?: number
    "schoolId"?: number
    "name"?: string
    "gradeName"?: string
    "sortOrder"?: number
    "status"?: string
    "createdAt"?: string
    "updatedAt"?: string
  }
  "PageResponsePublicClassListResponse": {
    "items"?: Array<OpenApiSchemas["PublicClassListResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponsePublicClassListResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponsePublicClassListResponse"]
    "traceId"?: string
  }
  "PublicClassAssignTeachersRequest": {
    "teacherIds": Array<number>
  }
  "key": Record<string, unknown>
  "MapObject": {
    "key"?: OpenApiSchemas["key1"]
  }
  "AppNotificationResponse": {
    "notificationId"?: number
    "type"?: string
    "title"?: string
    "content"?: string
    "sourceType"?: string
    "sourceId"?: number
    "data"?: OpenApiSchemas["MapObject"]
    "readAt"?: string
    "createdAt"?: string
  }
  "PageResponseAppNotificationResponse": {
    "items"?: Array<OpenApiSchemas["AppNotificationResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponseAppNotificationResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseAppNotificationResponse"]
    "traceId"?: string
  }
  "UnreadNotificationCountResponse": {
    "unreadCount"?: number
  }
  "ApiResponseUnreadNotificationCountResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["UnreadNotificationCountResponse"]
    "traceId"?: string
  }
  "PublicCompetitionDetailResponse": {
    "id"?: number
    "schoolId"?: number
    "scopeType"?: string
    "title"?: string
    "coverFileId"?: number
    "summary"?: string
    "content"?: string
    "infoUrl"?: string
    "location"?: string
    "competitionStartAt"?: string
    "competitionEndAt"?: string
    "registrationStartAt"?: string
    "registrationEndAt"?: string
    "maxParticipants"?: number
    "registeredCount"?: number
    "status"?: string
    "createdBy"?: number
    "createdAt"?: string
    "updatedAt"?: string
  }
  "ApiResponsePublicCompetitionDetailResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PublicCompetitionDetailResponse"]
    "traceId"?: string
  }
  "AdminCompetitionCreateRequest": {
    "title": string
    "schoolId"?: number
    "scopeType"?: string
    "coverFileId"?: number
    "summary"?: string
    "content"?: string
    "infoUrl"?: string
    "location"?: string
    "competitionStartAt"?: string
    "competitionEndAt"?: string
    "registrationStartAt"?: string
    "registrationEndAt": string
    "maxParticipants"?: number
  }
  "AdminCompetitionUpdateRequest": {
    "title"?: string
    "scopeType"?: string
    "coverFileId"?: number
    "summary"?: string
    "content"?: string
    "infoUrl"?: string
    "location"?: string
    "competitionStartAt"?: string
    "competitionEndAt"?: string
    "registrationStartAt"?: string
    "registrationEndAt"?: string
    "maxParticipants"?: number
  }
  "AdminCompetitionRegistrationResponse": {
    "registrationId"?: number
    "studentId"?: number
    "classId"?: number
    "studentName"?: string
    "className"?: string
    "guardianName"?: string
    "guardianPhone"?: string
    "remark"?: string
    "status"?: string
    "createdAt"?: string
    "canceledAt"?: string
  }
  "PageResponseAdminCompetitionRegistrationResponse": {
    "items"?: Array<OpenApiSchemas["AdminCompetitionRegistrationResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponseAdminCompetitionRegistrationResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseAdminCompetitionRegistrationResponse"]
    "traceId"?: string
  }
  "AdminInfoUrlUpdateRequest": {
    "infoUrl"?: string
  }
  "key2": Record<string, unknown>
  "ApiResponseListMapObject": {
    "code"?: string
    "message"?: string
    "data"?: Array<OpenApiSchemas["MapObject"]>
    "traceId"?: string
  }
  "MapLong": {
    "key"?: number
  }
  "PublicCompetitionListResponse": {
    "id"?: number
    "title"?: string
    "scopeType"?: string
    "status"?: string
    "registrationEndAt"?: string
    "registeredCount"?: number
    "maxParticipants"?: number
    "createdAt"?: string
    "updatedAt"?: string
  }
  "PageResponsePublicCompetitionListResponse": {
    "items"?: Array<OpenApiSchemas["PublicCompetitionListResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponsePublicCompetitionListResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponsePublicCompetitionListResponse"]
    "traceId"?: string
  }
  "PublicRegistrationCountResponse": {
    "total"?: number
    "submitted"?: number
    "approved"?: number
    "rejected"?: number
    "canceled"?: number
  }
  "ApiResponsePublicRegistrationCountResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PublicRegistrationCountResponse"]
    "traceId"?: string
  }
  "AppCompetitionListItemResponse": {
    "competitionId"?: number
    "title"?: string
    "coverFileId"?: number
    "coverUrl"?: string
    "summary"?: string
    "location"?: string
    "competitionStartAt"?: string
    "competitionEndAt"?: string
    "registrationStartAt"?: string
    "registrationEndAt"?: string
    "maxParticipants"?: number
    "registeredCount"?: number
    "registrationOpen"?: boolean
    "registrationStatus"?: string
  }
  "PageResponseAppCompetitionListItemResponse": {
    "items"?: Array<OpenApiSchemas["AppCompetitionListItemResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponseAppCompetitionListItemResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseAppCompetitionListItemResponse"]
    "traceId"?: string
  }
  "CompetitionLeaderResponse": {
    "userId"?: number
    "name"?: string
    "avatarFileId"?: number
  }
  "AppCompetitionDetailResponse": {
    "competitionId"?: number
    "scopeType"?: string
    "title"?: string
    "coverFileId"?: number
    "coverUrl"?: string
    "summary"?: string
    "content"?: string
    "infoUrl"?: string
    "location"?: string
    "competitionStartAt"?: string
    "competitionEndAt"?: string
    "registrationStartAt"?: string
    "registrationEndAt"?: string
    "maxParticipants"?: number
    "registeredCount"?: number
    "registrationOpen"?: boolean
    "registrationStatus"?: string
    "leaders"?: Array<OpenApiSchemas["CompetitionLeaderResponse"]>
  }
  "ApiResponseAppCompetitionDetailResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["AppCompetitionDetailResponse"]
    "traceId"?: string
  }
  "AppRegistrationListItemResponse": {
    "registrationId"?: number
    "competitionId"?: number
    "competitionTitle"?: string
    "coverFileId"?: number
    "coverUrl"?: string
    "studentId"?: number
    "studentName"?: string
    "classId"?: number
    "className"?: string
    "status"?: string
    "competitionStartAt"?: string
    "registrationEndAt"?: string
    "createdAt"?: string
    "canceledAt"?: string
  }
  "PageResponseAppRegistrationListItemResponse": {
    "items"?: Array<OpenApiSchemas["AppRegistrationListItemResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponseAppRegistrationListItemResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseAppRegistrationListItemResponse"]
    "traceId"?: string
  }
  "AppRegistrationDetailResponse": {
    "registrationId"?: number
    "competitionId"?: number
    "competitionTitle"?: string
    "coverFileId"?: number
    "coverUrl"?: string
    "competitionSummary"?: string
    "competitionInfoUrl"?: string
    "location"?: string
    "competitionStartAt"?: string
    "competitionEndAt"?: string
    "studentId"?: number
    "studentName"?: string
    "classId"?: number
    "className"?: string
    "guardianName"?: string
    "guardianPhone"?: string
    "remark"?: string
    "status"?: string
    "createdAt"?: string
    "updatedAt"?: string
    "canceledAt"?: string
  }
  "ApiResponseAppRegistrationDetailResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["AppRegistrationDetailResponse"]
    "traceId"?: string
  }
  "CompetitionRegistrationResponse": {
    "registrationId"?: number
    "competitionId"?: number
    "studentId"?: number
    "classId"?: number
    "status"?: string
    "remark"?: string
    "createdAt"?: string
    "canceledAt"?: string
  }
  "ApiResponseCompetitionRegistrationResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["CompetitionRegistrationResponse"]
    "traceId"?: string
  }
  "CreateCompetitionRegistrationRequest": {
    "remark"?: string
  }
  "AdminExportTaskDetailResponse": {
    "id"?: number
    "schoolId"?: number
    "createdBy"?: number
    "taskType"?: string
    "scopeType"?: string
    "filterJson"?: string
    "status"?: string
    "fileId"?: number
    "recordCount"?: number
    "errorMessage"?: string
    "startedAt"?: string
    "completedAt"?: string
    "expiresAt"?: string
    "createdAt"?: string
  }
  "TeacherWorkbenchStatsResponse": {
    "classCount"?: number
    "studentCount"?: number
    "todayMomentCount"?: number
    "unreadMessageCount"?: number
    "unreadNotificationCount"?: number
    "availableCompetitionCount"?: number
  }
  "ApiResponseAdminExportTaskDetailResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["AdminExportTaskDetailResponse"]
    "traceId"?: string
  }
  "AdminExportTaskCreateRequest": {
    "taskType": string
    "scopeType": string
    "filterJson"?: string
  }
  "AdminExportTaskListResponse": {
    "id"?: number
    "taskType"?: string
    "scopeType"?: string
    "status"?: string
    "recordCount"?: number
    "fileId"?: number
    "errorMessage"?: string
    "startedAt"?: string
    "completedAt"?: string
    "expiresAt"?: string
    "createdAt"?: string
  }
  "PageResponseAdminExportTaskListResponse": {
    "items"?: Array<OpenApiSchemas["AdminExportTaskListResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "TeacherWorkbenchSummaryResponse": {
    "teacherId"?: number
    "schoolId"?: number
    "teacherName"?: string
    "stats"?: OpenApiSchemas["TeacherWorkbenchStatsResponse"]
    "classes"?: Array<OpenApiSchemas["AppTeacherClassResponse"]>
    "latestMoments"?: Array<OpenApiSchemas["HomeMomentItemResponse"]>
    "availableCompetitions"?: Array<OpenApiSchemas["HomeCompetitionItemResponse"]>
  }
  "ApiResponsePageResponseAdminExportTaskListResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseAdminExportTaskListResponse"]
    "traceId"?: string
  }
  "ApiResponseTeacherWorkbenchSummaryResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["TeacherWorkbenchSummaryResponse"]
    "traceId"?: string
  }
  "InputStream": Record<string, unknown>
  "File": {
    "path"?: string
    "name"?: string
    "parent"?: string
    "parentFile"?: OpenApiSchemas["File"]
    "absolute"?: boolean
    "absolutePath"?: string
    "absoluteFile"?: OpenApiSchemas["File"]
    "canonicalPath"?: string
    "canonicalFile"?: OpenApiSchemas["File"]
    "directory"?: boolean
    "file"?: boolean
    "hidden"?: boolean
    "lastModified"?: number
    "writable"?: boolean
    "readable"?: boolean
    "executable"?: boolean
    "totalSpace"?: number
    "freeSpace"?: number
    "usableSpace"?: number
  }
  "URI": {
    "string"?: string
    "absolute"?: boolean
    "opaque"?: boolean
    "rawSchemeSpecificPart"?: string
    "rawAuthority"?: string
    "rawUserInfo"?: string
    "rawPath"?: string
    "rawQuery"?: string
    "rawFragment"?: string
  }
  "AdminExportTaskDownloadResponse": {
    "fileId"?: number
    "url"?: string
    "originalName"?: string
    "fileSize"?: number
    "mimeType"?: string
    "expiresAt"?: string
  }
  "ApiResponseAdminExportTaskDownloadResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["AdminExportTaskDownloadResponse"]
    "traceId"?: string
  }
  "DashboardStatsResponse": {
    "totalUsers"?: number
    "totalSchools"?: number
    "totalTeachers"?: number
    "totalParents"?: number
    "totalMoments"?: number
    "totalCompetitions"?: number
    "totalRegistrations"?: number
    "todayNewUsers"?: number
    "todayNewMoments"?: number
    "todayNewRegistrations"?: number
  }
  "ApiResponseDashboardStatsResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["DashboardStatsResponse"]
    "traceId"?: string
  }
  "key3": Record<string, unknown>
  "key4": Record<string, unknown>
  "ResponseEntityResource": {
    "inputStream"?: OpenApiSchemas["InputStream"]
    "readable"?: boolean
    "open"?: boolean
    "file"?: OpenApiSchemas["File"]
    "uRL"?: string
    "uRI"?: OpenApiSchemas["URI"]
    "filePath"?: Array<Array<Array<Record<string, unknown>>>>
    "contentAsByteArray"?: Array<number>
    "filename"?: string
    "description"?: string
  }
  "DashboardTrendResponse": {
    "userRegistration"?: Array<OpenApiSchemas["MapObject"]>
    "userActive"?: Array<OpenApiSchemas["MapObject"]>
  }
  "ApiResponseDashboardTrendResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["DashboardTrendResponse"]
    "traceId"?: string
  }
  "key5": Record<string, unknown>
  "key6": Record<string, unknown>
  "key7": Record<string, unknown>
  "DashboardRankingResponse": {
    "userRanking"?: Array<OpenApiSchemas["MapObject"]>
    "registrationRanking"?: Array<OpenApiSchemas["MapObject"]>
    "momentRanking"?: Array<OpenApiSchemas["MapObject"]>
  }
  "ApiResponseDashboardRankingResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["DashboardRankingResponse"]
    "traceId"?: string
  }
  "OpenStudentListResponse": {
    "id"?: number
    "schoolId"?: number
    "schoolName"?: string
    "name"?: string
    "gender"?: string
    "bindCode"?: string
    "enrollmentStatus"?: string
    "status"?: string
    "classId"?: number
    "className"?: string
    "guardianCount"?: number
    "createdAt"?: string
  }
  "PageResponseOpenStudentListResponse": {
    "items"?: Array<OpenApiSchemas["OpenStudentListResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "key1": Record<string, unknown>
  "DashboardOperationResponse": {
    "recentOperations"?: Array<OpenApiSchemas["MapObject"]>
  }
  "ApiResponsePageResponseOpenStudentListResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseOpenStudentListResponse"]
    "traceId"?: string
  }
  "ApiResponseDashboardOperationResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["DashboardOperationResponse"]
    "traceId"?: string
  }
  "GuardianBindingResponse": {
    "bindingId"?: number
    "studentId"?: number
    "schoolId"?: number
    "schoolName"?: string
    "studentName"?: string
    "relationType"?: string
    "bindStatus"?: string
    "bindSource"?: string
    "approvedAt"?: string
    "createdAt"?: string
  }
  "ApiResponseListGuardianBindingResponse": {
    "code"?: string
    "message"?: string
    "data"?: Array<OpenApiSchemas["GuardianBindingResponse"]>
    "traceId"?: string
  }
  "ApiResponseGuardianBindingResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["GuardianBindingResponse"]
    "traceId"?: string
  }
  "BindStudentRequest": {
    "schoolId": number
    "studentName": string
    "studentNo"?: string
    "birthday"?: string
    "bindCode": string
    "relationType": string
  }
  "key8": Record<string, unknown>
  "PublicStudentListResponse": {
    "id"?: number
    "schoolId"?: number
    "schoolName"?: string
    "name"?: string
    "gender"?: string
    "bindCode"?: string
    "enrollmentStatus"?: string
    "status"?: string
    "guardiansCount"?: number
    "createdAt"?: string
    "phoneNumber"?: string
  }
  "PageResponseMapObject": {
    "items"?: Array<OpenApiSchemas["MapObject"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "PageResponsePublicStudentListResponse": {
    "items"?: Array<OpenApiSchemas["PublicStudentListResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponseMapObject": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseMapObject"]
    "traceId"?: string
  }
  "ApiResponsePageResponsePublicStudentListResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponsePublicStudentListResponse"]
    "traceId"?: string
  }
  "OpenStudentClassResponse": {
    "classId"?: number
    "className"?: string
    "isPrimary"?: boolean
  }
  "PublicStudentClassResponse": {
    "classId"?: number
    "className"?: string
    "isPrimary"?: boolean
  }
  "OpenStudentDetailResponse": {
    "id"?: number
    "schoolId"?: number
    "schoolName"?: string
    "name"?: string
    "gender"?: string
    "birthday"?: string
    "studentNo"?: string
    "bindCode"?: string
    "enrollmentStatus"?: string
    "status"?: string
    "classes"?: Array<OpenApiSchemas["OpenStudentClassResponse"]>
    "guardianCount"?: number
    "importBatchId"?: number
    "createdAt"?: string
    "updatedAt"?: string
  }
  "PublicStudentDetailResponse": {
    "id"?: number
    "schoolId"?: number
    "schoolName"?: string
    "name"?: string
    "gender"?: string
    "birthday"?: string
    "studentNo"?: string
    "bindCode"?: string
    "enrollmentStatus"?: string
    "status"?: string
    "classes"?: Array<OpenApiSchemas["PublicStudentClassResponse"]>
    "guardianCount"?: number
    "importBatchId"?: number
    "createdAt"?: string
    "updatedAt"?: string
    "phoneNumber"?: string
  }
  "ApiResponseOpenStudentDetailResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["OpenStudentDetailResponse"]
    "traceId"?: string
  }
  "ApiResponsePublicStudentDetailResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PublicStudentDetailResponse"]
    "traceId"?: string
  }
  "OpenStudentCreateRequest": {
    "schoolId"?: number
    "name": string
    "gender"?: string
    "birthday"?: string
    "studentNo"?: string
    "classId"?: number
    "phoneNum": string
  }
  "PublicStudentCreateRequest": {
    "schoolId"?: number
    "name": string
    "gender"?: string
    "birthday"?: string
    "studentNo"?: string
    "classId"?: number
    "phoneNumber": string
  }
  "OpenStudentUpdateRequest": {
    "name"?: string
    "gender"?: string
    "birthday"?: string
    "studentNo"?: string
    "classId"?: number
    "enrollmentStatus"?: string
  }
  "PublicStudentUpdateRequest": {
    "name"?: string
    "gender"?: string
    "birthday"?: string
    "studentNo"?: string
    "classId"?: number
    "enrollmentStatus"?: string
    "phoneNumber"?: string
  }
  "OpenStudentGuardianResponse": {
    "guardianUserId"?: number
    "guardianName"?: string
    "guardianPhone"?: string
    "relationType"?: string
    "bindStatus"?: string
    "bindSource"?: string
    "isPrimary"?: boolean
    "createdAt"?: string
  }
  "PublicStudentSetClassRequest": {
    "classId": number
  }
  "ApiResponseListOpenStudentGuardianResponse": {
    "code"?: string
    "message"?: string
    "data"?: Array<OpenApiSchemas["OpenStudentGuardianResponse"]>
    "traceId"?: string
  }
  "PublicStudentGuardianResponse": {
    "guardianUserId"?: number
    "guardianName"?: string
    "guardianPhone"?: string
    "relationType"?: string
    "bindStatus"?: string
    "bindSource"?: string
    "isPrimary"?: boolean
    "createdAt"?: string
  }
  "OpenStudentProfileEventResponse": {
    "id"?: number
    "eventType"?: string
    "sourceType"?: string
    "title"?: string
    "summary"?: string
    "occurredAt"?: string
  }
  "ApiResponseListPublicStudentGuardianResponse": {
    "code"?: string
    "message"?: string
    "data"?: Array<OpenApiSchemas["PublicStudentGuardianResponse"]>
    "traceId"?: string
  }
  "ApiResponseListOpenStudentProfileEventResponse": {
    "code"?: string
    "message"?: string
    "data"?: Array<OpenApiSchemas["OpenStudentProfileEventResponse"]>
    "traceId"?: string
  }
  "PublicStudentProfileEventResponse": {
    "id"?: number
    "eventType"?: string
    "sourceType"?: string
    "title"?: string
    "summary"?: string
    "occurredAt"?: string
  }
  "OpenImportBatchResponse": {
    "id"?: number
    "schoolId"?: number
    "schoolName"?: string
    "status"?: string
    "successCount"?: number
    "failureCount"?: number
    "importFileId"?: number
    "errorReportFileId"?: number
    "autoCreateClass"?: boolean
    "remark"?: string
    "startedAt"?: string
    "completedAt"?: string
    "createdAt"?: string
  }
  "ApiResponseListPublicStudentProfileEventResponse": {
    "code"?: string
    "message"?: string
    "data"?: Array<OpenApiSchemas["PublicStudentProfileEventResponse"]>
    "traceId"?: string
  }
  "PageResponseOpenImportBatchResponse": {
    "items"?: Array<OpenApiSchemas["OpenImportBatchResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "PublicImportBatchResponse": {
    "id"?: number
    "schoolId"?: number
    "schoolName"?: string
    "status"?: string
    "successCount"?: number
    "failureCount"?: number
    "importFileId"?: number
    "errorReportFileId"?: number
    "autoCreateClass"?: boolean
    "remark"?: string
    "startedAt"?: string
    "completedAt"?: string
    "createdAt"?: string
  }
  "ApiResponsePageResponseOpenImportBatchResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseOpenImportBatchResponse"]
    "traceId"?: string
  }
  "PageResponsePublicImportBatchResponse": {
    "items"?: Array<OpenApiSchemas["PublicImportBatchResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponseOpenImportBatchResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["OpenImportBatchResponse"]
    "traceId"?: string
  }
  "ApiResponsePageResponsePublicImportBatchResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponsePublicImportBatchResponse"]
    "traceId"?: string
  }
  "ApiResponsePublicImportBatchResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PublicImportBatchResponse"]
    "traceId"?: string
  }
  "AppStudentClassResponse": {
    "classId"?: number
    "className"?: string
    "gradeName"?: string
    "primary"?: boolean
  }
  "AppStudentListItemResponse": {
    "studentId"?: number
    "schoolId"?: number
    "schoolName"?: string
    "name"?: string
    "gender"?: string
    "birthday"?: string
    "studentNo"?: string
    "enrollmentStatus"?: string
    "relationType"?: string
    "primaryClass"?: OpenApiSchemas["AppStudentClassResponse"]
    "classes"?: Array<OpenApiSchemas["AppStudentClassResponse"]>
    "phoneNumber"?: string
  }
  "ApiResponseListAppStudentListItemResponse": {
    "code"?: string
    "message"?: string
    "data"?: Array<OpenApiSchemas["AppStudentListItemResponse"]>
    "traceId"?: string
  }
  "CurrentStudentContextResponse": {
    "currentStudentId"?: number
    "student"?: OpenApiSchemas["AppStudentListItemResponse"]
  }
  "AppTeacherClassResponse": {
    "classId"?: number
    "className"?: string
    "gradeName"?: string
    "isHeadTeacher"?: boolean
    "studentCount"?: number
  }
  "ApiResponseCurrentStudentContextResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["CurrentStudentContextResponse"]
    "traceId"?: string
  }
  "ApiResponseListAppTeacherClassResponse": {
    "code"?: string
    "message"?: string
    "data"?: Array<OpenApiSchemas["AppTeacherClassResponse"]>
    "traceId"?: string
  }
  "ApiResponseAppStudentListItemResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["AppStudentListItemResponse"]
    "traceId"?: string
  }
  "SwitchCurrentStudentRequest": {
    "studentId": number
  }
  "AppCurrentStudentContextResponse": {
    "currentStudentId"?: number
    "student"?: OpenApiSchemas["AppStudentListItemResponse"]
  }
  "ApiResponseAppCurrentStudentContextResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["AppCurrentStudentContextResponse"]
    "traceId"?: string
  }
  "AppSwitchCurrentStudentRequest": {
    "studentId": number
  }
  "StudentProfileEventResponse": {
    "profileEventId"?: number
    "studentId"?: number
    "classId"?: number
    "className"?: string
    "eventType"?: string
    "sourceType"?: string
    "sourceId"?: number
    "title"?: string
    "summary"?: string
    "metadataJson"?: string
    "occurredAt"?: string
    "createdAt"?: string
  }
  "PageResponseStudentProfileEventResponse": {
    "items"?: Array<OpenApiSchemas["StudentProfileEventResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponseStudentProfileEventResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseStudentProfileEventResponse"]
    "traceId"?: string
  }
  "AdminMessageBroadcastDetailResponse": {
    "id"?: number
    "scope"?: string
    "schoolId"?: number
    "status"?: string
    "totalCount"?: number
    "successCount"?: number
    "failureCount"?: number
    "createdAt"?: string
    "completedAt"?: string
    "creatorId"?: number
    "content"?: string
    "attachmentFileIds"?: Array<number>
    "recipientStatusCounts"?: OpenApiSchemas["MapLong"]
  }
  "ApiResponseAdminMessageBroadcastDetailResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["AdminMessageBroadcastDetailResponse"]
    "traceId"?: string
  }
  "CreateMessageBroadcastRequest": {
    "scope": string
    "schoolId"?: number
    "recipientUserIds"?: Array<number>
    "content": string
    "attachmentFileIds"?: Array<number>
  }
  "AdminMessageBroadcastListResponse": {
    "id"?: number
    "scope"?: string
    "schoolId"?: number
    "status"?: string
    "totalCount"?: number
    "successCount"?: number
    "failureCount"?: number
    "createdAt"?: string
    "completedAt"?: string
  }
  "PageResponseAdminMessageBroadcastListResponse": {
    "items"?: Array<OpenApiSchemas["AdminMessageBroadcastListResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponseAdminMessageBroadcastListResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseAdminMessageBroadcastListResponse"]
    "traceId"?: string
  }
  "MessageContactResponse": {
    "id"?: number
    "realName"?: string
    "nickname"?: string
    "avatarFileId"?: number
    "avatarUrl"?: string
    "roles"?: Array<string>
  }
  "ApiResponseListMessageContactResponse": {
    "code"?: string
    "message"?: string
    "data"?: Array<OpenApiSchemas["MessageContactResponse"]>
    "traceId"?: string
  }
  "MessageConversationResponse": {
    "conversationId"?: number
    "conversationType"?: string
    "participant"?: OpenApiSchemas["MessageContactResponse"]
    "lastMessageId"?: number
    "lastMessagePreview"?: string
    "lastMessageAt"?: string
    "unreadCount"?: number
    "pinned"?: boolean
    "muted"?: boolean
  }
  "PageResponseMessageConversationResponse": {
    "items"?: Array<OpenApiSchemas["MessageConversationResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponseMessageConversationResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseMessageConversationResponse"]
    "traceId"?: string
  }
  "UUID": {
    "mostSigBits"?: number
    "leastSigBits"?: number
  }
  "MessageAttachmentResponse": {
    "fileId"?: number
    "url"?: string
    "originalName"?: string
    "mimeType"?: string
    "mediaType"?: string
    "fileSize"?: number
  }
  "MessageItemResponse": {
    "messageId"?: number
    "conversationId"?: number
    "clientMessageId"?: OpenApiSchemas["UUID"]
    "sender"?: OpenApiSchemas["MessageContactResponse"]
    "receiver"?: OpenApiSchemas["MessageContactResponse"]
    "content"?: string
    "messageType"?: string
    "attachmentFileIds"?: Array<number>
    "attachments"?: Array<OpenApiSchemas["MessageAttachmentResponse"]>
    "readAt"?: string
    "recalledAt"?: string
    "recalledBy"?: number
    "recallNotice"?: string
    "createdAt"?: string
  }
  "PageResponseMessageItemResponse": {
    "items"?: Array<OpenApiSchemas["MessageItemResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponseMessageItemResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseMessageItemResponse"]
    "traceId"?: string
  }
  "ApiResponseMessageItemResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["MessageItemResponse"]
    "traceId"?: string
  }
  "SendMessageRequest": {
    "clientMessageId": OpenApiSchemas["UUID"]
    "receiverId": number
    "content"?: string
    "attachmentFileIds"?: Array<number>
  }
  "ConversationSettingsRequest": {
    "pinned"?: boolean
    "muted"?: boolean
  }
  "UnreadMessageCountResponse": {
    "unreadCount"?: number
  }
  "ApiResponseUnreadMessageCountResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["UnreadMessageCountResponse"]
    "traceId"?: string
  }
  "AdminNewsArticleDetailResponse": {
    "id"?: number
    "categoryId"?: number
    "categoryName"?: string
    "title"?: string
    "summary"?: string
    "coverFileId"?: number
    "contentMarkdown"?: string
    "contentHtml"?: string
    "isPinned"?: boolean
    "sortOrder"?: number
    "status"?: string
    "publishAt"?: string
    "createdBy"?: number
    "updatedBy"?: number
    "createdAt"?: string
    "updatedAt"?: string
  }
  "ApiResponseAdminNewsArticleDetailResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["AdminNewsArticleDetailResponse"]
    "traceId"?: string
  }
  "AdminNewsArticleCreateRequest": {
    "categoryId": number
    "title": string
    "summary"?: string
    "coverFileId"?: number
    "contentMarkdown": string
    "contentHtml"?: string
    "isPinned"?: boolean
    "sortOrder"?: number
    "publishAt"?: string
  }
  "AdminNewsArticleUpdateRequest": {
    "categoryId"?: number
    "title"?: string
    "summary"?: string
    "coverFileId"?: number
    "contentMarkdown"?: string
    "contentHtml"?: string
    "isPinned"?: boolean
    "sortOrder"?: number
    "publishAt"?: string
  }
  "AdminNewsArticlePinRequest": {
    "isPinned": boolean
  }
  "AdminNewsArticleSortOrderRequest": {
    "sortOrder": number
  }
  "AdminNewsArticleCategoryRequest": {
    "categoryId": number
  }
  "AdminNewsArticleScheduleRequest": {
    "publishAt": string
  }
  "AdminNewsArticleListResponse": {
    "id"?: number
    "categoryId"?: number
    "categoryName"?: string
    "title"?: string
    "summary"?: string
    "coverFileId"?: number
    "isPinned"?: boolean
    "sortOrder"?: number
    "status"?: string
    "publishAt"?: string
    "createdByName"?: string
    "createdAt"?: string
    "updatedAt"?: string
  }
  "PageResponseAdminNewsArticleListResponse": {
    "items"?: Array<OpenApiSchemas["AdminNewsArticleListResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponseAdminNewsArticleListResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseAdminNewsArticleListResponse"]
    "traceId"?: string
  }
  "AdminPageContentDetailResponse": {
    "id"?: number
    "pageKey"?: string
    "title"?: string
    "contentMarkdown"?: string
    "contentHtml"?: string
    "status"?: string
    "currentVersion"?: number
    "updatedBy"?: number
    "publishedAt"?: string
    "createdAt"?: string
    "updatedAt"?: string
  }
  "ApiResponseAdminPageContentDetailResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["AdminPageContentDetailResponse"]
    "traceId"?: string
  }
  "AdminPageContentCreateRequest": {
    "pageKey": string
    "title"?: string
    "contentMarkdown"?: string
    "contentHtml"?: string
  }
  "AdminPageContentUpdateRequest": {
    "title"?: string
    "contentMarkdown"?: string
    "contentHtml"?: string
  }
  "AdminPageContentListResponse": {
    "id"?: number
    "pageKey"?: string
    "title"?: string
    "status"?: string
    "currentVersion"?: number
    "publishedAt"?: string
    "createdAt"?: string
    "updatedAt"?: string
  }
  "PageResponseAdminPageContentListResponse": {
    "items"?: Array<OpenApiSchemas["AdminPageContentListResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponseAdminPageContentListResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseAdminPageContentListResponse"]
    "traceId"?: string
  }
  "AdminPageContentVersionResponse": {
    "id"?: number
    "version"?: number
    "title"?: string
    "status"?: string
    "createdBy"?: number
    "createdAt"?: string
  }
  "ApiResponseListAdminPageContentVersionResponse": {
    "code"?: string
    "message"?: string
    "data"?: Array<OpenApiSchemas["AdminPageContentVersionResponse"]>
    "traceId"?: string
  }
  "AdminPageContentVersionDetailResponse": {
    "id"?: number
    "version"?: number
    "title"?: string
    "contentMarkdown"?: string
    "contentHtml"?: string
    "status"?: string
    "createdBy"?: number
    "createdAt"?: string
  }
  "ApiResponseAdminPageContentVersionDetailResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["AdminPageContentVersionDetailResponse"]
    "traceId"?: string
  }
  "AdminNewsCategoryResponse": {
    "id"?: number
    "code"?: string
    "name"?: string
    "sortOrder"?: number
    "status"?: string
    "createdAt"?: string
    "updatedAt"?: string
  }
  "ApiResponseAdminNewsCategoryResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["AdminNewsCategoryResponse"]
    "traceId"?: string
  }
  "AdminNewsCategoryCreateRequest": {
    "name": string
    "sortOrder"?: number
  }
  "AdminNewsCategoryUpdateRequest": {
    "name"?: string
    "sortOrder"?: number
    "status"?: string
  }
  "PageResponseAdminNewsCategoryResponse": {
    "items"?: Array<OpenApiSchemas["AdminNewsCategoryResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponseAdminNewsCategoryResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseAdminNewsCategoryResponse"]
    "traceId"?: string
  }
  "PublicNewsCategoryResponse": {
    "id"?: number
    "code"?: string
    "name"?: string
    "sortOrder"?: number
  }
  "ApiResponseListPublicNewsCategoryResponse": {
    "code"?: string
    "message"?: string
    "data"?: Array<OpenApiSchemas["PublicNewsCategoryResponse"]>
    "traceId"?: string
  }
  "PublicNewsArticleListResponse": {
    "id"?: number
    "categoryId"?: number
    "categoryName"?: string
    "title"?: string
    "summary"?: string
    "coverFileId"?: number
    "isPinned"?: boolean
    "sortOrder"?: number
    "publishAt"?: string
    "createdAt"?: string
  }
  "PageResponsePublicNewsArticleListResponse": {
    "items"?: Array<OpenApiSchemas["PublicNewsArticleListResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponsePublicNewsArticleListResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponsePublicNewsArticleListResponse"]
    "traceId"?: string
  }
  "PublicNewsArticleDetailResponse": {
    "id"?: number
    "categoryId"?: number
    "categoryName"?: string
    "title"?: string
    "summary"?: string
    "coverFileId"?: number
    "contentHtml"?: string
    "isPinned"?: boolean
    "publishAt"?: string
    "createdAt"?: string
    "updatedAt"?: string
  }
  "ApiResponsePublicNewsArticleDetailResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PublicNewsArticleDetailResponse"]
    "traceId"?: string
  }
  "PublicPageContentResponse": {
    "pageKey"?: string
    "title"?: string
    "contentHtml"?: string
    "publishedAt"?: string
    "updatedAt"?: string
  }
  "ApiResponsePublicPageContentResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PublicPageContentResponse"]
    "traceId"?: string
  }
  "AdminUserListItemResponse": {
    "id"?: number
    "schoolId"?: number
    "schoolName"?: string
    "phone"?: string
    "realName"?: string
    "nickname"?: string
    "gender"?: string
    "roles"?: Array<string>
    "status"?: string
    "lastLoginAt"?: string
    "createdAt"?: string
  }
  "PageResponseAdminUserListItemResponse": {
    "items"?: Array<OpenApiSchemas["AdminUserListItemResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponseAdminUserListItemResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseAdminUserListItemResponse"]
    "traceId"?: string
  }
  "AdminTeacherClassResponse": {
    "classId"?: number
    "className"?: string
    "isHeadTeacher"?: boolean
  }
  "ApiResponseMapObject": {
    "code"?: string
    "message"?: string
    "data"?: {
    "time"?: string
    "status"?: string
    "service"?: string
  }
    "traceId"?: string
  }
  "AdminUserDetailResponse": {
    "id"?: number
    "schoolId"?: number
    "schoolName"?: string
    "phone"?: string
    "realName"?: string
    "nickname"?: string
    "avatarFileId"?: number
    "gender"?: string
    "status"?: string
    "mustChangePassword"?: boolean
    "roles"?: Array<string>
    "classes"?: Array<OpenApiSchemas["AdminTeacherClassResponse"]>
    "lastLoginAt"?: string
    "createdAt"?: string
    "updatedAt"?: string
  }
  "ApiResponseAdminUserDetailResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["AdminUserDetailResponse"]
    "traceId"?: string
  }
  "AdminUserCreateRequest": {
    "phone": string
    "realName": string
    "roleCode": string
    "schoolId"?: number
    "nickname"?: string
    "gender"?: string
  }
  "AdminUserUpdateRequest": {
    "realName"?: string
    "nickname"?: string
    "gender"?: string
    "avatarFileId"?: number
    "phone"?: string
  }
  "AdminUserRoleUpdateRequest": {
    "roleCode": string
  }
  "AdminUserSchoolUpdateRequest": {
    "schoolId": number
  }
  "AdminTeacherClassesUpdateRequest": {
    "classIds": Array<number>
  }
  "ApiResponseString": {
    "code"?: string
    "message"?: string
    "data"?: string
    "traceId"?: string
  }
  "OpenUserCreateResponse": {
    "user"?: OpenApiSchemas["AdminUserDetailResponse"]
    "temporaryPassword"?: string
  }
  "ApiResponseOpenUserCreateResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["OpenUserCreateResponse"]
    "traceId"?: string
  }
  "PublicUserBindStudentsRequest": {
    "studentIds": Array<number>
    "relationType"?: string
  }
  "AdminContentReportListItemResponse": {
    "reportId"?: number
    "schoolId"?: number
    "targetType"?: string
    "targetId"?: number
    "targetSummary"?: string
    "reporterUserId"?: number
    "reporterName"?: string
    "targetAuthorUserId"?: number
    "targetAuthorName"?: string
    "reason"?: string
    "status"?: string
    "createdAt"?: string
  }
  "PageResponseAdminContentReportListItemResponse": {
    "items"?: Array<OpenApiSchemas["AdminContentReportListItemResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponseAdminContentReportListItemResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseAdminContentReportListItemResponse"]
    "traceId"?: string
  }
  "AdminContentReportDetailResponse": {
    "reportId"?: number
    "schoolId"?: number
    "targetType"?: string
    "targetId"?: number
    "targetSummary"?: string
    "reporterUserId"?: number
    "reporterName"?: string
    "targetAuthorUserId"?: number
    "targetAuthorName"?: string
    "reason"?: string
    "status"?: string
    "handledByUserId"?: number
    "handlerName"?: string
    "handledAction"?: string
    "handledNote"?: string
    "handledAt"?: string
    "createdAt"?: string
  }
  "ApiResponseAdminContentReportDetailResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["AdminContentReportDetailResponse"]
    "traceId"?: string
  }
  "HandleContentReportRequest": {
    "action": string
    "note"?: string
  }
  "MomentMediaResponse": {
    "fileId"?: number
    "url"?: string
    "mediaType"?: string
    "sortOrder"?: number
  }
  "AppMomentDetailResponse": {
    "momentId"?: number
    "classId"?: number
    "className"?: string
    "authorUserId"?: number
    "authorName"?: string
    "authorAvatarFileId"?: number
    "content"?: string
    "visibility"?: string
    "media"?: Array<OpenApiSchemas["MomentMediaResponse"]>
    "likesCount"?: number
    "commentsCount"?: number
    "likedByMe"?: boolean
    "createdAt"?: string
  }
  "ApiResponseAppMomentDetailResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["AppMomentDetailResponse"]
    "traceId"?: string
  }
  "CreateAppMomentRequest": {
    "content"?: string
    "classId"?: number
    "visibility": string
    "mediaFileIds"?: Array<number>
    "studentIds"?: Array<number>
  }
  "UpdateAppMomentRequest": {
    "content"?: string
    "mediaFileIds"?: Array<number>
  }
  "AppMomentListItemResponse": {
    "momentId"?: number
    "classId"?: number
    "className"?: string
    "authorUserId"?: number
    "authorName"?: string
    "authorAvatarFileId"?: number
    "contentPreview"?: string
    "media"?: Array<OpenApiSchemas["MomentMediaResponse"]>
    "likesCount"?: number
    "commentsCount"?: number
    "likedByMe"?: boolean
    "createdAt"?: string
  }
  "PageResponseAppMomentListItemResponse": {
    "items"?: Array<OpenApiSchemas["AppMomentListItemResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponseAppMomentListItemResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseAppMomentListItemResponse"]
    "traceId"?: string
  }
  "MomentCommentResponse": {
    "commentId"?: number
    "parentId"?: number
    "userId"?: number
    "authorName"?: string
    "authorAvatarFileId"?: number
    "content"?: string
    "createdAt"?: string
    "media"?: Array<OpenApiSchemas["MomentMediaResponse"]>
  }
  "PageResponseMomentCommentResponse": {
    "items"?: Array<OpenApiSchemas["MomentCommentResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponseMomentCommentResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseMomentCommentResponse"]
    "traceId"?: string
  }
  "MomentLikeResponse": {
    "momentId"?: number
    "likesCount"?: number
    "likedByMe"?: boolean
  }
  "ApiResponseMomentLikeResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["MomentLikeResponse"]
    "traceId"?: string
  }
  "ApiResponseMomentCommentResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["MomentCommentResponse"]
    "traceId"?: string
  }
  "CreateMomentCommentRequest": {
    "parentId"?: number
    "content"?: string
    "mediaFileIds"?: Array<number>
  }
  "ContentReportSubmissionResponse": {
    "reportId"?: number
    "status"?: string
    "createdAt"?: string
  }
  "ApiResponseContentReportSubmissionResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["ContentReportSubmissionResponse"]
    "traceId"?: string
  }
  "CreateContentReportRequest": {
    "reason": string
  }
  "ForumAuthorResponse": {
    "displayName"?: string
    "avatarFileId"?: number
    "avatarUrl"?: string
    "role"?: string
  }
  "ForumMediaResponse": {
    "fileId"?: number
    "url"?: string
    "mediaType"?: string
    "sortOrder"?: number
  }
  "AppForumTopicListItemResponse": {
    "topicId"?: number
    "title"?: string
    "contentSummary"?: string
    "tag"?: string
    "author"?: OpenApiSchemas["ForumAuthorResponse"]
    "likesCount"?: number
    "repliesCount"?: number
    "viewsCount"?: number
    "likedByMe"?: boolean
    "pinned"?: boolean
    "createdAt"?: string
    "media"?: Array<OpenApiSchemas["ForumMediaResponse"]>
  }
  "PageResponseAppForumTopicListItemResponse": {
    "items"?: Array<OpenApiSchemas["AppForumTopicListItemResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponseAppForumTopicListItemResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseAppForumTopicListItemResponse"]
    "traceId"?: string
  }
  "AppForumTopicDetailResponse": {
    "topicId"?: number
    "title"?: string
    "content"?: string
    "tag"?: string
    "author"?: OpenApiSchemas["ForumAuthorResponse"]
    "likesCount"?: number
    "repliesCount"?: number
    "viewsCount"?: number
    "likedByMe"?: boolean
    "pinned"?: boolean
    "createdAt"?: string
    "media"?: Array<OpenApiSchemas["ForumMediaResponse"]>
  }
  "ApiResponseAppForumTopicDetailResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["AppForumTopicDetailResponse"]
    "traceId"?: string
  }
  "CreateForumTopicRequest": {
    "title": string
    "content"?: string
    "tag": string
    "mediaFileIds"?: Array<number>
  }
  "UpdateForumTopicRequest": {
    "title": string
    "content"?: string
    "tag": string
    "mediaFileIds"?: Array<number>
  }
  "AppForumReplyResponse": {
    "replyId"?: number
    "topicId"?: number
    "content"?: string
    "author"?: OpenApiSchemas["ForumAuthorResponse"]
    "createdAt"?: string
    "media"?: Array<OpenApiSchemas["ForumMediaResponse"]>
  }
  "PageResponseAppForumReplyResponse": {
    "items"?: Array<OpenApiSchemas["AppForumReplyResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponseAppForumReplyResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseAppForumReplyResponse"]
    "traceId"?: string
  }
  "ApiResponseAppForumReplyResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["AppForumReplyResponse"]
    "traceId"?: string
  }
  "CreateForumReplyRequest": {
    "content"?: string
    "mediaFileIds"?: Array<number>
  }
  "UpdateForumReplyRequest": {
    "content"?: string
    "mediaFileIds"?: Array<number>
  }
  "ForumTopicLikeResponse": {
    "topicId"?: number
    "likesCount"?: number
    "liked"?: boolean
  }
  "ApiResponseForumTopicLikeResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["ForumTopicLikeResponse"]
    "traceId"?: string
  }
  "AuditLogListResponse": {
    "id"?: number
    "operatorUserId"?: number
    "operatorRoleCode"?: string
    "schoolId"?: number
    "module"?: string
    "action"?: string
    "targetType"?: string
    "targetId"?: number
    "result"?: string
    "riskLevel"?: string
    "ipAddress"?: string
    "createdAt"?: string
  }
  "PageResponseAuditLogListResponse": {
    "items"?: Array<OpenApiSchemas["AuditLogListResponse"]>
    "page"?: number
    "pageSize"?: number
    "total"?: number
    "totalPages"?: number
  }
  "ApiResponsePageResponseAuditLogListResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["PageResponseAuditLogListResponse"]
    "traceId"?: string
  }
  "AuditLogDetailResponse": {
    "id"?: number
    "operatorUserId"?: number
    "operatorRoleCode"?: string
    "schoolId"?: number
    "module"?: string
    "action"?: string
    "targetType"?: string
    "targetId"?: number
    "beforeData"?: string
    "afterData"?: string
    "result"?: string
    "riskLevel"?: string
    "ipAddress"?: string
    "userAgent"?: string
    "prevHash"?: string
    "currentHash"?: string
    "createdAt"?: string
  }
  "ApiResponseAuditLogDetailResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["AuditLogDetailResponse"]
    "traceId"?: string
  }
  "HomeStatsResponse": {
    "boundStudentCount"?: number
    "latestMomentCount"?: number
    "availableCompetitionCount"?: number
  }
  "HomeMomentItemResponse": {
    "momentId"?: number
    "classId"?: number
    "className"?: string
    "contentPreview"?: string
    "likesCount"?: number
    "commentsCount"?: number
    "createdAt"?: string
  }
  "HomeCompetitionItemResponse": {
    "competitionId"?: number
    "title"?: string
    "summary"?: string
    "registrationEndAt"?: string
    "registeredCount"?: number
    "maxParticipants"?: number
  }
  "HomeSummaryResponse": {
    "currentStudent"?: OpenApiSchemas["AppStudentListItemResponse"]
    "stats"?: OpenApiSchemas["HomeStatsResponse"]
    "latestMoments"?: Array<OpenApiSchemas["HomeMomentItemResponse"]>
    "availableCompetitions"?: Array<OpenApiSchemas["HomeCompetitionItemResponse"]>
  }
  "ApiResponseHomeSummaryResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["HomeSummaryResponse"]
    "traceId"?: string
  }
  "FileUploadResponse": {
    "fileId"?: number
    "url"?: string
    "originalName"?: string
    "mimeType"?: string
    "mediaType"?: string
    "fileSize"?: number
  }
  "ApiResponseFileUploadResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["FileUploadResponse"]
    "traceId"?: string
  }
  "AppMeResponse": {
    "id"?: number
    "schoolId"?: number
    "phone"?: string
    "realName"?: string
    "roles"?: Array<string>
  }
  "ApiResponseAppMeResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["AppMeResponse"]
    "traceId"?: string
  }
  "MyProfileResponse": {
    "id"?: number
    "schoolId"?: number
    "username"?: string
    "phone"?: string
    "realName"?: string
    "nickname"?: string
    "avatarFileId"?: number
    "gender"?: string
    "mustChangePassword"?: boolean
    "roles"?: Array<string>
  }
  "ApiResponseMyProfileResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["MyProfileResponse"]
    "traceId"?: string
  }
  "UpdateMyProfileRequest": {
    "nickname"?: string
    "avatarFileId"?: number
    "gender"?: string
  }
  "UpdateMyPasswordRequest": {
    "oldPassword": string
    "newPassword": string
  }
  "SmsCodeResponse": {
    "expiresInSeconds"?: number
    "devCode"?: string
  }
  "ApiResponseSmsCodeResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["SmsCodeResponse"]
    "traceId"?: string
  }
  "SmsCodeSendRequest": {
    "phone": string
    "scene": string
  }
  "LoginUserResponse": {
    "id"?: number
    "schoolId"?: number
    "phone"?: string
    "realName"?: string
    "roles"?: Array<string>
  }
  "LoginResponse": {
    "accessToken"?: string
    "refreshToken"?: string
    "expiresIn"?: number
    "user"?: OpenApiSchemas["LoginUserResponse"]
  }
  "ApiResponseLoginResponse": {
    "code"?: string
    "message"?: string
    "data"?: OpenApiSchemas["LoginResponse"]
    "traceId"?: string
  }
  "LoginRequest": {
    "phone": string
    "password": string
  }
  "SmsLoginRequest": {
    "phone": string
    "smsCode": string
  }
  "RegisterRequest": {
    "phone": string
    "smsCode": string
    "password": string
    "realName": string
    "schoolId": number
    "studentName": string
    "studentNo"?: string
    "birthday"?: string
    "bindCode": string
    "relationType": string
  }
  "RefreshTokenRequest": {
    "refreshToken": string
  }
  "LogoutRequest": {
    "refreshToken": string
  }
  "ResetPasswordRequest": {
    "phone": string
    "smsCode": string
    "newPassword": string
  }
  "AdminLoginRequest": {
    "account": string
    "password": string
  }
}

export interface OpenApiOperations {
  "DELETE /api/admin/competitions/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "DELETE /api/admin/news-articles/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "DELETE /api/admin/news-categories/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "DELETE /api/admin/users/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "DELETE /api/app/forum-topics/{topicId}": {
    parameters: {
      path: {
      "topicId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "DELETE /api/app/forum-topics/{topicId}/like": {
    parameters: {
      path: {
      "topicId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseForumTopicLikeResponse"]
  }
  "DELETE /api/app/forum-topics/{topicId}/replies/{replyId}": {
    parameters: {
      path: {
      "topicId": number
      "replyId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "DELETE /api/app/guardians/bindings/{bindingId}": {
    parameters: {
      path: {
      "bindingId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "DELETE /api/app/messages/{messageId}": {
    parameters: {
      path: {
      "messageId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "DELETE /api/app/moments/{momentId}": {
    parameters: {
      path: {
      "momentId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "DELETE /api/app/moments/{momentId}/comments/{commentId}": {
    parameters: {
      path: {
      "momentId": number
      "commentId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "DELETE /api/app/moments/{momentId}/like": {
    parameters: {
      path: {
      "momentId": number
    }
      query: Record<string, never>
      header: {
      "X-Current-Student-Id"?: string
    }
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseMomentLikeResponse"]
  }
  "DELETE /api/app/registrations/{registrationId}": {
    parameters: {
      path: {
      "registrationId": number
    }
      query: Record<string, never>
      header: {
      "X-Current-Student-Id"?: string
    }
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseCompetitionRegistrationResponse"]
  }
  "DELETE /api/public/classes/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "DELETE /api/public/students/{id}/class": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "GET /api/admin/audit-logs": {
    parameters: {
      path: Record<string, never>
      query: {
      "page"?: number
      "pageSize"?: number
      "sort"?: string
      "operatorUserId"?: number
      "module"?: string
      "action"?: string
      "targetType"?: string
      "riskLevel"?: string
      "result"?: string
      "startTime"?: string
      "endTime"?: string
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseAuditLogListResponse"]
  }
  "GET /api/admin/audit-logs/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAuditLogDetailResponse"]
  }
  "GET /api/admin/competitions/{id}/registrations": {
    parameters: {
      path: {
      "id": number
    }
      query: {
      "page": number
      "pageSize": number
      "status"?: string
      "keyword"?: string
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseAdminCompetitionRegistrationResponse"]
  }
  "GET /api/admin/content-reports": {
    parameters: {
      path: Record<string, never>
      query: {
      "schoolId"?: number
      "status"?: string
      "targetType"?: string
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseAdminContentReportListItemResponse"]
  }
  "GET /api/admin/content-reports/{reportId}": {
    parameters: {
      path: {
      "reportId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminContentReportDetailResponse"]
  }
  "GET /api/admin/dashboard/operations": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseDashboardOperationResponse"]
  }
  "GET /api/admin/dashboard/rankings": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseDashboardRankingResponse"]
  }
  "GET /api/admin/dashboard/stats": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseDashboardStatsResponse"]
  }
  "GET /api/admin/dashboard/trends": {
    parameters: {
      path: Record<string, never>
      query: {
      "days": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseDashboardTrendResponse"]
  }
  "GET /api/admin/export-tasks": {
    parameters: {
      path: Record<string, never>
      query: {
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseAdminExportTaskListResponse"]
  }
  "GET /api/admin/export-tasks/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminExportTaskDetailResponse"]
  }
  "GET /api/admin/export-tasks/{id}/download": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ResponseEntityResource"]
  }
  "GET /api/admin/export-tasks/{id}/download-info": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminExportTaskDownloadResponse"]
  }
  "GET /api/admin/message-broadcasts": {
    parameters: {
      path: Record<string, never>
      query: {
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseAdminMessageBroadcastListResponse"]
  }
  "GET /api/admin/message-broadcasts/{broadcastId}": {
    parameters: {
      path: {
      "broadcastId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminMessageBroadcastDetailResponse"]
  }
  "GET /api/admin/news-articles": {
    parameters: {
      path: Record<string, never>
      query: {
      "keyword"?: string
      "categoryId"?: number
      "status"?: string
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseAdminNewsArticleListResponse"]
  }
  "GET /api/admin/news-articles/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminNewsArticleDetailResponse"]
  }
  "GET /api/admin/news-categories": {
    parameters: {
      path: Record<string, never>
      query: {
      "keyword"?: string
      "status"?: string
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseAdminNewsCategoryResponse"]
  }
  "GET /api/admin/news-categories/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminNewsCategoryResponse"]
  }
  "GET /api/admin/page-contents": {
    parameters: {
      path: Record<string, never>
      query: {
      "keyword"?: string
      "status"?: string
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseAdminPageContentListResponse"]
  }
  "GET /api/admin/page-contents/{pageKey}": {
    parameters: {
      path: {
      "pageKey": string
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminPageContentDetailResponse"]
  }
  "GET /api/admin/page-contents/{pageKey}/versions": {
    parameters: {
      path: {
      "pageKey": string
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseListAdminPageContentVersionResponse"]
  }
  "GET /api/admin/page-contents/{pageKey}/versions/{version}": {
    parameters: {
      path: {
      "pageKey": string
      "version": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminPageContentVersionDetailResponse"]
  }
  "GET /api/admin/schools": {
    parameters: {
      path: Record<string, never>
      query: {
      "name"?: string
      "contactName"?: string
      "status"?: string
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponsePublicSchoolListResponse"]
  }
  "GET /api/admin/schools/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePublicSchoolDetailResponse"]
  }
  "GET /api/admin/schools/{id}/overview": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminSchoolOverviewResponse"]
  }
  "GET /api/admin/users": {
    parameters: {
      path: Record<string, never>
      query: {
      "phone"?: string
      "realName"?: string
      "roleCode"?: string
      "schoolId"?: number
      "status"?: string
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseAdminUserListItemResponse"]
  }
  "GET /api/admin/users/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminUserDetailResponse"]
  }
  "GET /api/app/competitions": {
    parameters: {
      path: Record<string, never>
      query: {
      "page": number
      "pageSize": number
    }
      header: {
      "X-Current-Student-Id"?: string
    }
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseAppCompetitionListItemResponse"]
  }
  "GET /api/app/competitions/{competitionId}": {
    parameters: {
      path: {
      "competitionId": number
    }
      query: Record<string, never>
      header: {
      "X-Current-Student-Id"?: string
    }
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAppCompetitionDetailResponse"]
  }
  "GET /api/app/forum-topics": {
    parameters: {
      path: Record<string, never>
      query: {
      "tag"?: string
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseAppForumTopicListItemResponse"]
  }
  "GET /api/app/forum-topics/mine": {
    parameters: {
      path: Record<string, never>
      query: {
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseAppForumTopicListItemResponse"]
  }
  "GET /api/app/forum-topics/{topicId}": {
    parameters: {
      path: {
      "topicId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAppForumTopicDetailResponse"]
  }
  "GET /api/app/forum-topics/{topicId}/replies": {
    parameters: {
      path: {
      "topicId": number
    }
      query: {
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseAppForumReplyResponse"]
  }
  "GET /api/app/guardians/bindings": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseListGuardianBindingResponse"]
  }
  "GET /api/app/home/summary": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: {
      "X-Current-Student-Id"?: string
    }
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseHomeSummaryResponse"]
  }
  "GET /api/app/me": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAppMeResponse"]
  }
  "GET /api/app/me/profile": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseMyProfileResponse"]
  }
  "GET /api/app/messages/contacts": {
    parameters: {
      path: Record<string, never>
      query: {
      "keyword"?: string
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseListMessageContactResponse"]
  }
  "GET /api/app/messages/conversations": {
    parameters: {
      path: Record<string, never>
      query: {
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseMessageConversationResponse"]
  }
  "GET /api/app/messages/conversations/{conversationId}/messages": {
    parameters: {
      path: {
      "conversationId": number
    }
      query: {
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseMessageItemResponse"]
  }
  "GET /api/app/messages/unread-count": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseUnreadMessageCountResponse"]
  }
  "GET /api/app/moments": {
    parameters: {
      path: Record<string, never>
      query: {
      "page": number
      "pageSize": number
    }
      header: {
      "X-Current-Student-Id"?: string
    }
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseAppMomentListItemResponse"]
  }
  "GET /api/app/moments/mine": {
    parameters: {
      path: Record<string, never>
      query: {
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseAppMomentListItemResponse"]
  }
  "GET /api/app/moments/{momentId}": {
    parameters: {
      path: {
      "momentId": number
    }
      query: Record<string, never>
      header: {
      "X-Current-Student-Id"?: string
    }
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAppMomentDetailResponse"]
  }
  "GET /api/app/moments/{momentId}/comments": {
    parameters: {
      path: {
      "momentId": number
    }
      query: {
      "page": number
      "pageSize": number
    }
      header: {
      "X-Current-Student-Id"?: string
    }
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseMomentCommentResponse"]
  }
  "GET /api/app/notifications": {
    parameters: {
      path: Record<string, never>
      query: {
      "page": number
      "pageSize": number
      "readStatus"?: string
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseAppNotificationResponse"]
  }
  "GET /api/app/notifications/unread-count": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseUnreadNotificationCountResponse"]
  }
  "GET /api/app/registrations": {
    parameters: {
      path: Record<string, never>
      query: {
      "status"?: string
      "page": number
      "pageSize": number
    }
      header: {
      "X-Current-Student-Id"?: string
    }
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseAppRegistrationListItemResponse"]
  }
  "GET /api/app/registrations/{registrationId}": {
    parameters: {
      path: {
      "registrationId": number
    }
      query: Record<string, never>
      header: {
      "X-Current-Student-Id"?: string
    }
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAppRegistrationDetailResponse"]
  }
  "GET /api/app/students/current-context": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: {
      "X-Current-Student-Id"?: string
    }
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAppCurrentStudentContextResponse"]
  }
  "GET /api/app/students/my": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseListAppStudentListItemResponse"]
  }
  "GET /api/app/students/my-classes": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseListAppTeacherClassResponse"]
  }
  "GET /api/app/students/{studentId}": {
    parameters: {
      path: {
      "studentId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAppStudentListItemResponse"]
  }
  "GET /api/app/students/{studentId}/profile-events": {
    parameters: {
      path: {
      "studentId": number
    }
      query: {
      "eventType"?: string
      "page": number
      "pageSize": number
    }
      header: {
      "X-Current-Student-Id"?: string
    }
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseStudentProfileEventResponse"]
  }
  "GET /api/app/teacher-workbench/summary": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseTeacherWorkbenchSummaryResponse"]
  }
  "GET /api/health": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseMapObject"]
  }
  "GET /api/open/audit-logs": {
    parameters: {
      path: Record<string, never>
      query: {
      "module"?: string
      "action"?: string
      "targetType"?: string
      "operatorUserId"?: number
      "riskLevel"?: string
      "result"?: string
      "startTime"?: string
      "endTime"?: string
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseAuditLogListResponse"]
  }
  "GET /api/open/audit-logs/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAuditLogDetailResponse"]
  }
  "GET /api/open/competitions/registrations": {
    parameters: {
      path: Record<string, never>
      query: {
      "parentId": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseListMapObject"]
  }
  "GET /api/open/competitions/{id}/registrations": {
    parameters: {
      path: {
      "id": number
    }
      query: {
      "classId"?: number
      "startTime"?: string
      "endTime"?: string
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseListMapObject"]
  }
  "GET /api/open/export-tasks": {
    parameters: {
      path: Record<string, never>
      query: {
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseAdminExportTaskListResponse"]
  }
  "GET /api/open/export-tasks/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminExportTaskDetailResponse"]
  }
  "GET /api/open/export-tasks/{id}/download": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ResponseEntityResource"]
  }
  "GET /api/open/users": {
    parameters: {
      path: Record<string, never>
      query: {
      "phone"?: string
      "realName"?: string
      "roleCode"?: string
      "schoolId"?: number
      "status"?: string
      "classId"?: number
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponseAdminUserListItemResponse"]
  }
  "GET /api/open/users/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminUserDetailResponse"]
  }
  "GET /api/public/classes": {
    parameters: {
      path: Record<string, never>
      query: {
      "schoolId"?: number
      "name"?: string
      "gradeName"?: string
      "status"?: string
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponsePublicClassListResponse"]
  }
  "GET /api/public/classes/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePublicClassDetailResponse"]
  }
  "GET /api/public/competitions": {
    parameters: {
      path: Record<string, never>
      query: {
      "keyword"?: string
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponsePublicCompetitionListResponse"]
  }
  "GET /api/public/competitions/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePublicCompetitionDetailResponse"]
  }
  "GET /api/public/competitions/{id}/registration-count": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePublicRegistrationCountResponse"]
  }
  "GET /api/public/news-articles": {
    parameters: {
      path: Record<string, never>
      query: {
      "categoryId"?: number
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponsePublicNewsArticleListResponse"]
  }
  "GET /api/public/news-articles/categories": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseListPublicNewsCategoryResponse"]
  }
  "GET /api/public/news-articles/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePublicNewsArticleDetailResponse"]
  }
  "GET /api/public/page-contents/{pageKey}": {
    parameters: {
      path: {
      "pageKey": string
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePublicPageContentResponse"]
  }
  "GET /api/public/schools": {
    parameters: {
      path: Record<string, never>
      query: {
      "name"?: string
      "contactName"?: string
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponsePublicSchoolListResponse"]
  }
  "GET /api/public/schools/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePublicSchoolDetailResponse"]
  }
  "GET /api/public/students": {
    parameters: {
      path: Record<string, never>
      query: {
      "name"?: string
      "studentNo"?: string
      "enrollmentStatus"?: string
      "status"?: string
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponsePublicStudentListResponse"]
  }
  "GET /api/public/students/import/batches": {
    parameters: {
      path: Record<string, never>
      query: {
      "page": number
      "pageSize": number
    }
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePageResponsePublicImportBatchResponse"]
  }
  "GET /api/public/students/import/batches/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePublicImportBatchResponse"]
  }
  "GET /api/public/students/import/template": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ResponseEntityResource"]
  }
  "GET /api/public/students/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePublicStudentDetailResponse"]
  }
  "GET /api/public/students/{id}/guardians": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseListPublicStudentGuardianResponse"]
  }
  "GET /api/public/students/{id}/profile": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseListPublicStudentProfileEventResponse"]
  }
  "PATCH /api/admin/competitions/{id}/info-url": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminInfoUrlUpdateRequest"] | undefined
    response: OpenApiSchemas["ApiResponsePublicCompetitionDetailResponse"]
  }
  "PATCH /api/admin/competitions/{id}/offline": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePublicCompetitionDetailResponse"]
  }
  "PATCH /api/admin/competitions/{id}/publish": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePublicCompetitionDetailResponse"]
  }
  "PATCH /api/admin/content-reports/{reportId}/handle": {
    parameters: {
      path: {
      "reportId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["HandleContentReportRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminContentReportDetailResponse"]
  }
  "PATCH /api/admin/news-articles/{id}/category": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminNewsArticleCategoryRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminNewsArticleDetailResponse"]
  }
  "PATCH /api/admin/news-articles/{id}/offline": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminNewsArticleDetailResponse"]
  }
  "PATCH /api/admin/news-articles/{id}/pin": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminNewsArticlePinRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminNewsArticleDetailResponse"]
  }
  "PATCH /api/admin/news-articles/{id}/publish": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminNewsArticleDetailResponse"]
  }
  "PATCH /api/admin/news-articles/{id}/sort-order": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminNewsArticleSortOrderRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminNewsArticleDetailResponse"]
  }
  "PATCH /api/admin/page-contents/{pageKey}/offline": {
    parameters: {
      path: {
      "pageKey": string
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminPageContentDetailResponse"]
  }
  "PATCH /api/admin/page-contents/{pageKey}/publish": {
    parameters: {
      path: {
      "pageKey": string
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminPageContentDetailResponse"]
  }
  "PATCH /api/admin/schools/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminSchoolUpdateRequest"] | undefined
    response: OpenApiSchemas["ApiResponsePublicSchoolDetailResponse"]
  }
  "PATCH /api/admin/schools/{id}/disable": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePublicSchoolDetailResponse"]
  }
  "PATCH /api/admin/schools/{id}/enable": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePublicSchoolDetailResponse"]
  }
  "PATCH /api/admin/users/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminUserUpdateRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminUserDetailResponse"]
  }
  "PATCH /api/admin/users/{id}/classes": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminTeacherClassesUpdateRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminUserDetailResponse"]
  }
  "PATCH /api/admin/users/{id}/disable": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminUserDetailResponse"]
  }
  "PATCH /api/admin/users/{id}/enable": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminUserDetailResponse"]
  }
  "PATCH /api/admin/users/{id}/role": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminUserRoleUpdateRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminUserDetailResponse"]
  }
  "PATCH /api/admin/users/{id}/school": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminUserSchoolUpdateRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminUserDetailResponse"]
  }
  "PATCH /api/app/messages/conversations/{conversationId}/read": {
    parameters: {
      path: {
      "conversationId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "PATCH /api/app/messages/conversations/{conversationId}/settings": {
    parameters: {
      path: {
      "conversationId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["ConversationSettingsRequest"] | undefined
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "PATCH /api/app/messages/{messageId}/read": {
    parameters: {
      path: {
      "messageId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "PATCH /api/app/messages/{messageId}/recall": {
    parameters: {
      path: {
      "messageId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "PATCH /api/app/notifications/read-all": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "PATCH /api/app/notifications/{notificationId}/read": {
    parameters: {
      path: {
      "notificationId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "PATCH /api/open/competitions/{id}/lead-teacher": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["MapLong"] | undefined
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "PATCH /api/open/users/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminUserUpdateRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminUserDetailResponse"]
  }
  "PATCH /api/open/users/{id}/classes": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminTeacherClassesUpdateRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminUserDetailResponse"]
  }
  "PATCH /api/open/users/{id}/disable": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminUserDetailResponse"]
  }
  "PATCH /api/open/users/{id}/enable": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminUserDetailResponse"]
  }
  "PATCH /api/public/classes/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["PublicClassUpdateRequest"] | undefined
    response: OpenApiSchemas["ApiResponsePublicClassDetailResponse"]
  }
  "PATCH /api/public/classes/{id}/disable": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePublicClassDetailResponse"]
  }
  "PATCH /api/public/classes/{id}/enable": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePublicClassDetailResponse"]
  }
  "PATCH /api/public/students/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["PublicStudentUpdateRequest"] | undefined
    response: OpenApiSchemas["ApiResponsePublicStudentDetailResponse"]
  }
  "PATCH /api/public/students/{id}/class": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["PublicStudentSetClassRequest"] | undefined
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "PATCH /api/public/students/{id}/disable": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePublicStudentDetailResponse"]
  }
  "PATCH /api/public/students/{id}/enable": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponsePublicStudentDetailResponse"]
  }
  "POST /api/admin/competitions": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminCompetitionCreateRequest"] | undefined
    response: OpenApiSchemas["ApiResponsePublicCompetitionDetailResponse"]
  }
  "POST /api/admin/export-tasks": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminExportTaskCreateRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminExportTaskDetailResponse"]
  }
  "POST /api/admin/message-broadcasts": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["CreateMessageBroadcastRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminMessageBroadcastDetailResponse"]
  }
  "POST /api/admin/message-broadcasts/{broadcastId}/retry": {
    parameters: {
      path: {
      "broadcastId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseAdminMessageBroadcastDetailResponse"]
  }
  "POST /api/admin/news-articles": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminNewsArticleCreateRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminNewsArticleDetailResponse"]
  }
  "POST /api/admin/news-categories": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminNewsCategoryCreateRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminNewsCategoryResponse"]
  }
  "POST /api/admin/page-contents": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminPageContentCreateRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminPageContentDetailResponse"]
  }
  "POST /api/admin/schools": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminSchoolCreateRequest"] | undefined
    response: OpenApiSchemas["ApiResponsePublicSchoolDetailResponse"]
  }
  "POST /api/admin/users": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminUserCreateRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminUserDetailResponse"]
  }
  "POST /api/admin/users/{id}/reset-password": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseString"]
  }
  "POST /api/app/competitions/{competitionId}/registrations": {
    parameters: {
      path: {
      "competitionId": number
    }
      query: Record<string, never>
      header: {
      "X-Current-Student-Id"?: string
    }
    }
    requestBody: OpenApiSchemas["CreateCompetitionRegistrationRequest"] | undefined
    response: OpenApiSchemas["ApiResponseCompetitionRegistrationResponse"]
  }
  "POST /api/app/files": {
    parameters: {
      path: Record<string, never>
      query: {
      "sourceType": string
    }
      header: Record<string, never>
    }
    requestBody: {
    "file": string
  } | undefined
    response: OpenApiSchemas["ApiResponseFileUploadResponse"]
  }
  "POST /api/app/forum-topics": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["CreateForumTopicRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAppForumTopicDetailResponse"]
  }
  "POST /api/app/forum-topics/{topicId}/like": {
    parameters: {
      path: {
      "topicId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseForumTopicLikeResponse"]
  }
  "POST /api/app/forum-topics/{topicId}/replies": {
    parameters: {
      path: {
      "topicId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["CreateForumReplyRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAppForumReplyResponse"]
  }
  "POST /api/app/forum-topics/{topicId}/replies/{replyId}/reports": {
    parameters: {
      path: {
      "topicId": number
      "replyId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["CreateContentReportRequest"] | undefined
    response: OpenApiSchemas["ApiResponseContentReportSubmissionResponse"]
  }
  "POST /api/app/forum-topics/{topicId}/reports": {
    parameters: {
      path: {
      "topicId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["CreateContentReportRequest"] | undefined
    response: OpenApiSchemas["ApiResponseContentReportSubmissionResponse"]
  }
  "POST /api/app/guardians/bind": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["BindStudentRequest"] | undefined
    response: OpenApiSchemas["ApiResponseGuardianBindingResponse"]
  }
  "POST /api/app/messages": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["SendMessageRequest"] | undefined
    response: OpenApiSchemas["ApiResponseMessageItemResponse"]
  }
  "POST /api/app/moments": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["CreateAppMomentRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAppMomentDetailResponse"]
  }
  "POST /api/app/moments/{momentId}/comments": {
    parameters: {
      path: {
      "momentId": number
    }
      query: Record<string, never>
      header: {
      "X-Current-Student-Id"?: string
    }
    }
    requestBody: OpenApiSchemas["CreateMomentCommentRequest"] | undefined
    response: OpenApiSchemas["ApiResponseMomentCommentResponse"]
  }
  "POST /api/app/moments/{momentId}/comments/{commentId}/reports": {
    parameters: {
      path: {
      "momentId": number
      "commentId": number
    }
      query: Record<string, never>
      header: {
      "X-Current-Student-Id"?: string
    }
    }
    requestBody: OpenApiSchemas["CreateContentReportRequest"] | undefined
    response: OpenApiSchemas["ApiResponseContentReportSubmissionResponse"]
  }
  "POST /api/app/moments/{momentId}/like": {
    parameters: {
      path: {
      "momentId": number
    }
      query: Record<string, never>
      header: {
      "X-Current-Student-Id"?: string
    }
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseMomentLikeResponse"]
  }
  "POST /api/app/moments/{momentId}/reports": {
    parameters: {
      path: {
      "momentId": number
    }
      query: Record<string, never>
      header: {
      "X-Current-Student-Id"?: string
    }
    }
    requestBody: OpenApiSchemas["CreateContentReportRequest"] | undefined
    response: OpenApiSchemas["ApiResponseContentReportSubmissionResponse"]
  }
  "POST /api/app/students/current-context": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AppSwitchCurrentStudentRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAppCurrentStudentContextResponse"]
  }
  "POST /api/open/export-tasks": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminExportTaskCreateRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminExportTaskDetailResponse"]
  }
  "POST /api/open/users": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminUserCreateRequest"] | undefined
    response: OpenApiSchemas["ApiResponseOpenUserCreateResponse"]
  }
  "POST /api/open/users/{id}/bind-students": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["PublicUserBindStudentsRequest"] | undefined
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "POST /api/public/admin/auth/login": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminLoginRequest"] | undefined
    response: OpenApiSchemas["ApiResponseLoginResponse"]
  }
  "POST /api/public/auth/login": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["LoginRequest"] | undefined
    response: OpenApiSchemas["ApiResponseLoginResponse"]
  }
  "POST /api/public/auth/logout": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["LogoutRequest"] | undefined
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "POST /api/public/auth/password/reset": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["ResetPasswordRequest"] | undefined
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "POST /api/public/auth/refresh": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["RefreshTokenRequest"] | undefined
    response: OpenApiSchemas["ApiResponseLoginResponse"]
  }
  "POST /api/public/auth/register": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["RegisterRequest"] | undefined
    response: OpenApiSchemas["ApiResponseLoginResponse"]
  }
  "POST /api/public/auth/sms-codes": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["SmsCodeSendRequest"] | undefined
    response: OpenApiSchemas["ApiResponseSmsCodeResponse"]
  }
  "POST /api/public/auth/sms-login": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["SmsLoginRequest"] | undefined
    response: OpenApiSchemas["ApiResponseLoginResponse"]
  }
  "POST /api/public/classes": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["PublicClassCreateRequest"] | undefined
    response: OpenApiSchemas["ApiResponsePublicClassDetailResponse"]
  }
  "POST /api/public/classes/{id}/teachers": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["PublicClassAssignTeachersRequest"] | undefined
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "POST /api/public/competitions": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminCompetitionCreateRequest"] | undefined
    response: OpenApiSchemas["ApiResponsePublicCompetitionDetailResponse"]
  }
  "POST /api/public/students": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["PublicStudentCreateRequest"] | undefined
    response: OpenApiSchemas["ApiResponsePublicStudentDetailResponse"]
  }
  "POST /api/public/students/import": {
    parameters: {
      path: Record<string, never>
      query: {
      "schoolId"?: number
      "autoCreateClass": boolean
      "remark"?: string
    }
      header: Record<string, never>
    }
    requestBody: {
    "file": string
  } | undefined
    response: OpenApiSchemas["ApiResponsePublicImportBatchResponse"]
  }
  "POST /api/public/students/{id}/guardians/{guardianUserId}/unbind": {
    parameters: {
      path: {
      "id": number
      "guardianUserId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: never
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "PUT /api/admin/competitions/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminCompetitionUpdateRequest"] | undefined
    response: OpenApiSchemas["ApiResponsePublicCompetitionDetailResponse"]
  }
  "PUT /api/admin/news-articles/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminNewsArticleUpdateRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminNewsArticleDetailResponse"]
  }
  "PUT /api/admin/news-articles/{id}/schedule": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminNewsArticleScheduleRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminNewsArticleDetailResponse"]
  }
  "PUT /api/admin/news-categories/{id}": {
    parameters: {
      path: {
      "id": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminNewsCategoryUpdateRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminNewsCategoryResponse"]
  }
  "PUT /api/admin/page-contents/{pageKey}": {
    parameters: {
      path: {
      "pageKey": string
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["AdminPageContentUpdateRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAdminPageContentDetailResponse"]
  }
  "PUT /api/app/forum-topics/{topicId}": {
    parameters: {
      path: {
      "topicId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["UpdateForumTopicRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAppForumTopicDetailResponse"]
  }
  "PUT /api/app/forum-topics/{topicId}/replies/{replyId}": {
    parameters: {
      path: {
      "topicId": number
      "replyId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["UpdateForumReplyRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAppForumReplyResponse"]
  }
  "PUT /api/app/me/password": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["UpdateMyPasswordRequest"] | undefined
    response: OpenApiSchemas["ApiResponseVoid"]
  }
  "PUT /api/app/me/profile": {
    parameters: {
      path: Record<string, never>
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["UpdateMyProfileRequest"] | undefined
    response: OpenApiSchemas["ApiResponseMyProfileResponse"]
  }
  "PUT /api/app/moments/{momentId}": {
    parameters: {
      path: {
      "momentId": number
    }
      query: Record<string, never>
      header: Record<string, never>
    }
    requestBody: OpenApiSchemas["UpdateAppMomentRequest"] | undefined
    response: OpenApiSchemas["ApiResponseAppMomentDetailResponse"]
  }
}

export type OpenApiSchemaName = keyof OpenApiSchemas
export type OpenApiOperationKey = keyof OpenApiOperations
export type OpenApiSchema<Name extends OpenApiSchemaName> = OpenApiSchemas[Name]
export type OpenApiOperation<Key extends OpenApiOperationKey> = OpenApiOperations[Key]
