/**
 * Wedring Backend — Profile Controller
 */
import * as profileService from './profile.service.js';
import * as profileSearch from './profile.search.js';
import { parsePagination } from '../../utils/pagination.js';
import { success, error } from '../../utils/response.js';

export async function updateGeneric(req, res, next) {
  try {
    const data = await profileService.upsertProfileSection(req.user.id, req.body);
    return success(res, data, 'Profile updated');
  } catch (err) { next(err); }
}

export async function getOwnProfile(req, res, next) {
  try {
    const data = await profileService.getOwnProfile(req.user.id);
    return success(res, data);
  } catch (err) { next(err); }
}

export async function getPublicProfile(req, res, next) {
  try {
    const data = await profileService.getPublicProfile(req.params.userId, req.user.id);
    return success(res, data);
  } catch (err) { next(err); }
}

export async function updatePersonal(req, res, next) {
  try {
    const data = await profileService.upsertProfileSection(req.user.id, req.body);
    return success(res, data, 'Personal details updated');
  } catch (err) { next(err); }
}

export async function updateReligion(req, res, next) {
  try {
    const data = await profileService.upsertProfileSection(req.user.id, req.body);
    return success(res, data, 'Religion details updated');
  } catch (err) { next(err); }
}

export async function updateEducation(req, res, next) {
  try {
    const data = await profileService.upsertProfileSection(req.user.id, req.body);
    return success(res, data, 'Education details updated');
  } catch (err) { next(err); }
}

export async function updateFamilyLocation(req, res, next) {
  try {
    const data = await profileService.upsertProfileSection(req.user.id, req.body);
    return success(res, data, 'Family & location details updated');
  } catch (err) { next(err); }
}

export async function updateHoroscope(req, res, next) {
  try {
    const data = await profileService.upsertProfileSection(req.user.id, req.body);
    return success(res, data, 'Horoscope details updated');
  } catch (err) { next(err); }
}

export async function updateAdditional(req, res, next) {
  try {
    const data = await profileService.upsertProfileSection(req.user.id, req.body);
    return success(res, data, 'Additional details updated');
  } catch (err) { next(err); }
}

export async function updatePartnerPreferences(req, res, next) {
  try {
    const data = await profileService.upsertPartnerPreferences(req.user.id, req.body);
    return success(res, data, 'Partner preferences updated');
  } catch (err) { next(err); }
}

export async function searchProfiles(req, res, next) {
  try {
    const { limit, offset } = parsePagination(req.query);
    // Parse filters from query
    const filters = {
      gender: req.query.gender,
      religion: req.query.religion,
      caste: req.query.caste,
      city: req.query.city,
      district: req.query.district,
      state: req.query.state,
      education: req.query.education,
      occupation: req.query.occupation,
      maritalStatus: req.query.maritalStatus,
      foodHabit: req.query.foodHabit,
      ageMin: req.query.ageMin,
      ageMax: req.query.ageMax,
      heightMin: req.query.heightMin,
      heightMax: req.query.heightMax,
    };
    const data = await profileSearch.searchProfiles(req.user.id, filters, limit, offset);
    return success(res, data);
  } catch (err) { next(err); }
}

export async function logProfileView(req, res, next) {
  try {
    await profileSearch.logProfileView(req.user.id, req.params.userId);
    return success(res, null, 'View logged');
  } catch (err) { next(err); }
}

export async function updateLastActive(req, res, next) {
  try {
    await profileSearch.updateLastActive(req.user.id);
    return success(res, null, 'Last active updated');
  } catch (err) { next(err); }
}

// Master data endpoints
export async function getStates(req, res, next) {
  try { return success(res, profileService.getStates()); } catch (err) { next(err); }
}

export async function getDistricts(req, res, next) {
  try { return success(res, profileService.getDistricts(req.params.state)); } catch (err) { next(err); }
}

export async function getCities(req, res, next) {
  try { return success(res, profileService.getCities(req.params.district)); } catch (err) { next(err); }
}

export async function getCastes(req, res, next) {
  try { return success(res, profileService.getCastes(req.params.religion)); } catch (err) { next(err); }
}

export default {
  getOwnProfile, getPublicProfile,
  updateGeneric, updatePersonal, updateReligion, updateEducation,
  updateFamilyLocation, updateHoroscope, updateAdditional,
  updatePartnerPreferences,
  searchProfiles, logProfileView, updateLastActive,
  getStates, getDistricts, getCities, getCastes,
};
