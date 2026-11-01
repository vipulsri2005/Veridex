import { CarInsuranceClaim, HealthInsuranceClaim, ValidationErrors } from '../types';

export function validateCarInsuranceClaim(data: CarInsuranceClaim): ValidationErrors<CarInsuranceClaim> {
  const errors: ValidationErrors<CarInsuranceClaim> = {};

  // Customer Information
  if (data.age === '' || data.age === undefined || data.age === null) {
    errors.age = 'Age is required';
  } else if (Number(data.age) < 18 || Number(data.age) > 105) {
    errors.age = 'Age must be between 18 and 105';
  }

  if (!data.gender) errors.gender = 'Gender is required';
  if (!data.education) errors.education = 'Education level is required';
  if (!data.occupation) errors.occupation = 'Occupation is required';
  if (!data.hobbies) errors.hobbies = 'Primary hobby/activity is required';
  if (!data.relationship) errors.relationship = 'Relationship status is required';

  if (data.monthsAsCustomer === '' || data.monthsAsCustomer === undefined) {
    errors.monthsAsCustomer = 'Months as customer is required';
  } else if (Number(data.monthsAsCustomer) < 0) {
    errors.monthsAsCustomer = 'Months as customer cannot be negative';
  } else if (Number(data.monthsAsCustomer) > 700) {
    errors.monthsAsCustomer = 'Please enter a valid tenure in months';
  }

  // Policy Information
  if (!data.policyNumber?.trim()) {
    errors.policyNumber = 'Policy number is required';
  }
  if (!data.policyState) errors.policyState = 'Policy state is required';
  if (!data.policyCsl) errors.policyCsl = 'Policy CSL limit is required';

  if (data.policyDeductible === '' || data.policyDeductible === undefined) {
    errors.policyDeductible = 'Deductible is required';
  } else if (Number(data.policyDeductible) < 0) {
    errors.policyDeductible = 'Deductible cannot be negative';
  }

  if (data.annualPremium === '' || data.annualPremium === undefined) {
    errors.annualPremium = 'Annual premium is required';
  } else if (Number(data.annualPremium) < 0) {
    errors.annualPremium = 'Annual premium cannot be negative';
  }

  if (data.umbrellaLimit === '' || data.umbrellaLimit === undefined) {
    errors.umbrellaLimit = 'Umbrella limit is required';
  } else if (Number(data.umbrellaLimit) < 0) {
    errors.umbrellaLimit = 'Umbrella limit cannot be negative';
  }

  // Incident Information
  if (!data.incidentType) errors.incidentType = 'Incident type is required';
  if (!data.collisionType) errors.collisionType = 'Collision type is required';
  if (!data.incidentSeverity) errors.incidentSeverity = 'Incident severity is required';
  if (!data.incidentState) errors.incidentState = 'Incident state is required';
  if (!data.incidentCity?.trim()) errors.incidentCity = 'Incident city is required';

  if (data.incidentHour === '' || data.incidentHour === undefined) {
    errors.incidentHour = 'Incident hour is required';
  } else if (Number(data.incidentHour) < 0 || Number(data.incidentHour) > 23) {
    errors.incidentHour = 'Incident hour must be between 0 and 23';
  }

  if (data.numberOfVehicles === '' || data.numberOfVehicles === undefined) {
    errors.numberOfVehicles = 'Number of vehicles is required';
  } else if (Number(data.numberOfVehicles) < 1) {
    errors.numberOfVehicles = 'Must involve at least 1 vehicle';
  }

  if (!data.propertyDamage) errors.propertyDamage = 'Property damage status is required';

  if (data.bodilyInjuries === '' || data.bodilyInjuries === undefined) {
    errors.bodilyInjuries = 'Bodily injuries count is required';
  } else if (Number(data.bodilyInjuries) < 0) {
    errors.bodilyInjuries = 'Injuries count cannot be negative';
  }

  if (data.witnesses === '' || data.witnesses === undefined) {
    errors.witnesses = 'Witnesses count is required';
  } else if (Number(data.witnesses) < 0) {
    errors.witnesses = 'Witnesses count cannot be negative';
  }

  if (!data.policeReportAvailable) errors.policeReportAvailable = 'Police report status is required';
  if (!data.authoritiesContacted) errors.authoritiesContacted = 'Authorities contacted is required';

  // Vehicle Information
  if (!data.vehicleMake?.trim()) errors.vehicleMake = 'Vehicle make is required';
  if (!data.vehicleModel?.trim()) errors.vehicleModel = 'Vehicle model is required';

  const currentYear = new Date().getFullYear();
  if (data.vehicleYear === '' || data.vehicleYear === undefined) {
    errors.vehicleYear = 'Vehicle year is required';
  } else if (Number(data.vehicleYear) < 1980 || Number(data.vehicleYear) > currentYear + 1) {
    errors.vehicleYear = `Vehicle year must be between 1980 and ${currentYear + 1}`;
  }

  // Claim Information
  if (data.totalClaimAmount === '' || data.totalClaimAmount === undefined) {
    errors.totalClaimAmount = 'Total claim amount is required';
  } else if (Number(data.totalClaimAmount) <= 0) {
    errors.totalClaimAmount = 'Total claim amount must be greater than 0';
  }

  if (data.injuryClaim === '' || data.injuryClaim === undefined) {
    errors.injuryClaim = 'Injury claim amount is required';
  } else if (Number(data.injuryClaim) < 0) {
    errors.injuryClaim = 'Injury claim cannot be negative';
  }

  if (data.propertyClaim === '' || data.propertyClaim === undefined) {
    errors.propertyClaim = 'Property claim amount is required';
  } else if (Number(data.propertyClaim) < 0) {
    errors.propertyClaim = 'Property claim cannot be negative';
  }

  if (data.vehicleClaim === '' || data.vehicleClaim === undefined) {
    errors.vehicleClaim = 'Vehicle claim amount is required';
  } else if (Number(data.vehicleClaim) < 0) {
    errors.vehicleClaim = 'Vehicle claim cannot be negative';
  }

  return errors;
}

export function validateHealthInsuranceClaim(data: HealthInsuranceClaim): ValidationErrors<HealthInsuranceClaim> {
  const errors: ValidationErrors<HealthInsuranceClaim> = {};

  // Customer Information
  if (!data.customerId?.trim()) {
    errors.customerId = 'Customer ID is required';
  }

  if (data.age === '' || data.age === undefined || data.age === null) {
    errors.age = 'Age is required';
  } else if (Number(data.age) < 0 || Number(data.age) > 115) {
    errors.age = 'Age must be between 0 and 115';
  }

  if (!data.gender) errors.gender = 'Gender is required';
  if (!data.educationLevel) errors.educationLevel = 'Education level is required';
  if (!data.employmentStatus) errors.employmentStatus = 'Employment status is required';
  if (!data.maritalStatus) errors.maritalStatus = 'Marital status is required';

  if (data.numberOfDependents === '' || data.numberOfDependents === undefined) {
    errors.numberOfDependents = 'Number of dependents is required';
  } else if (Number(data.numberOfDependents) < 0) {
    errors.numberOfDependents = 'Dependents cannot be negative';
  }

  // Policy Information
  if (!data.insuranceType) errors.insuranceType = 'Insurance plan type is required';

  if (!data.policyEffectiveDate) {
    errors.policyEffectiveDate = 'Policy effective date is required';
  }
  if (!data.policyExpiryDate) {
    errors.policyExpiryDate = 'Policy expiry date is required';
  }

  if (data.policyEffectiveDate && data.policyExpiryDate) {
    const eff = new Date(data.policyEffectiveDate);
    const exp = new Date(data.policyExpiryDate);
    if (isNaN(eff.getTime())) {
      errors.policyEffectiveDate = 'Invalid effective date';
    }
    if (isNaN(exp.getTime())) {
      errors.policyExpiryDate = 'Invalid expiry date';
    }
    if (!isNaN(eff.getTime()) && !isNaN(exp.getTime()) && exp < eff) {
      errors.policyExpiryDate = 'Expiry date cannot be earlier than effective date';
    }
  }

  if (data.premiumAmount === '' || data.premiumAmount === undefined) {
    errors.premiumAmount = 'Premium amount is required';
  } else if (Number(data.premiumAmount) < 0) {
    errors.premiumAmount = 'Premium amount cannot be negative';
  }

  if (data.policyDuration === '' || data.policyDuration === undefined) {
    errors.policyDuration = 'Policy duration (months) is required';
  } else if (Number(data.policyDuration) <= 0) {
    errors.policyDuration = 'Policy duration must be greater than 0';
  }

  // Claim Information
  if (data.claimAmount === '' || data.claimAmount === undefined) {
    errors.claimAmount = 'Claim amount is required';
  } else if (Number(data.claimAmount) <= 0) {
    errors.claimAmount = 'Claim amount must be greater than 0';
  }

  if (!data.claimDate) {
    errors.claimDate = 'Claim date is required';
  }
  if (!data.lossDate) {
    errors.lossDate = 'Loss / admission date is required';
  }

  if (data.claimDate && data.lossDate) {
    const claim = new Date(data.claimDate);
    const loss = new Date(data.lossDate);
    if (isNaN(claim.getTime())) errors.claimDate = 'Invalid claim date';
    if (isNaN(loss.getTime())) errors.lossDate = 'Invalid loss date';
    if (!isNaN(claim.getTime()) && !isNaN(loss.getTime()) && claim < loss) {
      errors.claimDate = 'Claim filing date cannot precede the loss date';
    }
  }

  if (!data.incidentType) errors.incidentType = 'Incident / procedure type is required';
  if (!data.incidentSeverity) errors.incidentSeverity = 'Incident severity is required';
  if (!data.riskSegmentation) errors.riskSegmentation = 'Risk segmentation is required';
  if (!data.claimStatus) errors.claimStatus = 'Claim audit status is required';

  return errors;
}
