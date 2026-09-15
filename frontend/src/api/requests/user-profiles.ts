import type {
  EditUserProfileRequest,
  EditUserProfileResponse,
  GetUserProfileRequest,
  GetUserProfileResponse,
  GetUserProfilesRequest,
  GetUserProfilesResponse,
  GetUserProfileSummaryRequest,
  GetUserProfileSummaryResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getUserProfiles(params: GetUserProfilesRequest) {
  return api.get<GetUserProfilesResponse>('user-profiles/get', { params })
}

export async function getUserProfile(params: GetUserProfileRequest) {
  return api.get<GetUserProfileResponse>('user-profiles/get-one', { params })
}

export async function getUserProfileSummary(params: GetUserProfileSummaryRequest) {
  return api.get<GetUserProfileSummaryResponse>('user-profiles/summary', { params })
}

export async function editUserProfile(params: EditUserProfileRequest) {
  return api.post<EditUserProfileResponse>('user-profiles/edit', params)
}
