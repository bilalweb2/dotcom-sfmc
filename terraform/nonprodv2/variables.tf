variable "environment" {}
variable "service_principal" {}
variable "subscription_id" {
  default = "1f2a6687-1bbf-4428-af19-8ef32b7d0817"
}
variable "tenant_id" {}
variable "image_tag" {
  default = "z_qat01.z_qat01.2a73d44"
}
variable "image" {
  default = "frontier-devops/dotcom-sfmc"
}

# variable "acr_name" {
#   default = "ftrRepo"
# }
# variable "acr_resource_group" {
#   default = "rg-infra-nonprod-001"
# }
variable "tfc_network_workspace_name" {
  default = "dig-dotcom-nonprod-network"
}
variable "tfc_org_name" {
  default = "frontier-devops"
}
variable "cpu_scale_in_threshold" {
  type        = number
  description = "CPU usage percentage to scale in"
  default     = 50
}

variable "cpu_scale_out_threshold" {
  type        = number
  description = "CPU usage percentage to scale out"
  default     = 80
}

variable "num_deploy_slots" {
  type        = number
  default     = 0
  description = "Defines the number of additional deployment slots to create"
}

variable "disable_logging" {
  type        = number
  default     = 0 // 0 - disable; 1 - enable
  description = "Controls logging"
}

variable "disable_auto-scaling" {
  type        = number
  default     = 0 // 0 - disable; 1 - enable
  description = "Controls auto-scaling"
}

variable "health_check" {
  default = "/ftr-forms"
}

variable "applicationinsights_connection_string" {
  default   = ""
  sensitive = true
}

variable "next_public_app_url" {
  default   = ""
  sensitive = true
}

variable "base_path" {
  default   = ""
  sensitive = true
}

variable "mongodb_uri" {
  default   = ""
  sensitive = true
}

variable "api_secret" {
  default   = ""
  sensitive = true
}

variable "dotcom_sfmc_baseurl" {
  default = ""
}

variable "dotcom_sfmc_auth_consumer_id" {
  default = ""
}

variable "dotcom_sfmc_auth_consumer_secret" {
  default   = ""
  sensitive = true
}

variable "new_relic_app_name" {
  default = ""
}

variable "new_relic_license_key" {
  default   = ""
  sensitive = true
}

variable "log_level" {
  default = ""
}

variable "emeid_aes_iv" {
  default   = ""
  sensitive = true
}

variable "emeid_aes_key" {
  default   = ""
  sensitive = true
}


variable "tip_token" {
  default = ""
  sensitive = true
}
