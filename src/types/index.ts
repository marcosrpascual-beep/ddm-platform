export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  phone?: string | null
  whatsappApiKey?: string | null
  isActive: boolean
  createdAt: string
}

export interface TaskAssignmentWithUser {
  id: string
  userId: string
  completedAt: string | null
  alarmed20: boolean
  user: {
    id: string
    name: string
    email: string
  }
}

export interface TaskWithAssignments {
  id: string
  title: string
  description: string | null
  priority: Priority
  durationDays: number
  durationHours: number
  deadline: string
  notified50: boolean
  createdAt: string
  createdBy: {
    id: string
    name: string
  }
  assignments: TaskAssignmentWithUser[]
}

export interface TaskAssignmentFull {
  id: string
  taskId: string
  userId: string
  completedAt: string | null
  alarmed20: boolean
  task: TaskWithAssignments
}
