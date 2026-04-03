/**
 * GraphQL documents for Celesc. Field lists are trimmed to what this app uses
 * (smaller payloads → faster responses than the full browser queries).
 *
 * CMS (Strapi): prefer one multi-field query over several HTTP round trips when
 * you need several roots (navbars, footers, scheduling, reference lists).
 */

/** UI: protocol, dates, status, description, formatting, service title. */
export const GET_ALL_REQUEST_TRACKINGS = `
query GetAllRequestTrackings($requestTrackingInput: RequestTrackingInput!) {
  getAllRequestTrackings(input: $requestTrackingInput) {
    requestTrackings {
      protocol
      nameProtocol
      status
      createdDate
      finishedDate
      description
      formatting
    }
    message
    error
  }
}
`;

/** Detail view for one protocol (acompanhamento da solicitação). */
export const GET_REQUEST_TRACKING_STATUS = `
query GetRequestTrackingStatus($requestTrackingStatusInput: RequestTrackingStatusInput!) {
  getRequestTrackingStatus(input: $requestTrackingStatusInput) {
    requestTrackingStatus {
      channel
      accessId
      resultMessage
      resultCode
      protocol
      nameProtocol
      namePartner
      telephone
      cellphone
      email
      taxnum
      address
      type
      tabStatus {
        link
        statusDatetime
        serviceclosed
        formatting
        protocol
        correction
        serviceCode
        nameService
        sequencial
        descriptionStep
        statusStep
        messageStep
      }
    }
    message
    error
  }
}
`;

export const CMS_NAVBARS = `
query CmsNavbars($channelCode: String!) {
  navbars(where: { channels: { code: $channelCode } }) {
    name
    navbarConfig {
      hasMenu
      hasNotification
      hasLoginButton
    }
    channels {
      code
    }
  }
}
`;

export const CMS_UNIT_SELECTION_PAGE = `
query CmsUnitSelectionPage($channelCode: String!, $pageName: String!) {
  services(where: { channels: { code: $channelCode }, name: $pageName }) {
    pages {
      __typename
      ... on ComponentPageConsumerUnitSelectionGeneric {
        title
        subtitle
        searchInputLabel
        hasStateFilter
      }
    }
  }
}
`;

export const CMS_CONSUMER_UNIT_TYPES = `
query CmsConsumerUnitTypes {
  consumerUnitTypes {
    code
    name
    icon
  }
}
`;

/**
 * UI: address (street, houseNum, city1, region, postCode, complement, referencePoint),
 * title (denomination, name), installation, contract, contractAccount, tarifType, status, alert.
 */
export const SAP_ALL_CONTRACTS = `
query SapAllContracts(
  $partner: String!
  $profileType: String
  $installation: String
  $owner: String
  $zipCode: String
) {
  allContracts(
    partner: $partner
    profileType: $profileType
    installation: $installation
    owner: $owner
    zipCode: $zipCode
  ) {
    contracts {
      installation
      contract
      contractAccount
      name
      denomination
      street
      houseNum
      postCode
      city1
      region
      complement
      referencePoint
      alert
      status
      tarifType
    }
    message
    error
  }
}
`;

export const CMS_FOOTERS = `
query CmsFooters($channelCode: String!, $profileType: String!) {
  footers(
    where: { channels: { code: $channelCode }, profiles: { code: $profileType } }
  ) {
    title
    name
    channels {
      code
      name
    }
    footerMenu {
      label
      route
      icon
    }
    footerSocialMenu {
      label
      url
      icon
    }
    copyright
  }
}
`;

/** One request for shell data: nav + footer + app config + UC types (fewer round trips than four calls). */
export const CMS_LAYOUT_BUNDLE = `
query CmsLayoutBundle($channelCode: String!, $profileType: String!) {
  navbars(where: { channels: { code: $channelCode } }) {
    name
    navbarConfig {
      hasMenu
      hasNotification
      hasLoginButton
    }
    channels {
      code
    }
  }
  footers(
    where: { channels: { code: $channelCode }, profiles: { code: $profileType } }
  ) {
    title
    name
    channels {
      code
      name
    }
    footerMenu {
      label
      route
      icon
    }
    footerSocialMenu {
      label
      url
      icon
    }
    copyright
  }
  schedulingConfigs {
    isMaintenanceMode
    allowUnverifiedUsersCreation
    hasFacebookEnabled
    hasGoogleEnabled
    hasAppleEnabled
    hasGovEnabled
    latestAndroidAppVersion
    latestIosAppVersion
  }
  consumerUnitTypes {
    code
    name
    icon
  }
}
`;

export const CMS_SCHEDULING_CONFIGS = `
query CmsSchedulingConfigs {
  schedulingConfigs {
    isMaintenanceMode
    allowUnverifiedUsersCreation
    hasFacebookEnabled
    hasGoogleEnabled
    hasAppleEnabled
    hasGovEnabled
    latestAndroidAppVersion
    latestIosAppVersion
  }
}
`;
