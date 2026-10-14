variable "location" {
  description = "The location of the resource group in which resources are created"
  default     = "centralus"
}

variable "account_kind" {
  description = "The kind of storage account."
  default     = "StorageV2"
}

variable "sku" {
  description = "The SKU of the storage account."
  default     = "Standard_GRS"
}
variable "enable_https_traffic" {
  description = "Configure the storage account to accept requests from secure connections only. Possible values are `true` or `false`"
  default     = true
}
variable "min_tls_version" {
  description = "The minimum supported TLS version for the storage account"
  default     = "TLS1_2"
}

variable "enable_static_website" {
  description = "Controls if static website to be enabled on the storage account. Possible values are `true` or `false`"
  default     = true
}

variable "static_website_source_folder" {
  description = "Set a source folder path to copy static website files to static website storage blob"
  default     = "../.next"
}

variable "assign_identity" {
  description = "Specifies the identity type of the Storage Account. At this time the only allowed value is SystemAssigned."
  default     = true
}


variable "index_path" {
  description = "path from your repo root to index.html"
  default     = "index.html"
}

variable "custom_404_path" {
  description = "path from your repo root to your custom 404 page"
  default     = "404.html"
}

variable "custom_domain_name" {
  type        = string
  description = "The custom domain name to use for your website"
  default     = null
}

variable "friendly_name" {
  type        = string
  description = "The friendly name of your custom domain in the Azure Portal"
  default     = ""
}

variable "allowed_methods" {
  type        = list(string)
  description = " A list of http headers that are allowed to be executed by the origin. Valid options are `DELETE`, `GET`, `HEAD`, `MERGE`, `POST`, `OPTIONS`, `PUT` or `PATCH`."
  default = [
    "GET",
    "HEAD"
  ]
}

variable "allowed_origins" {
  type        = list(string)
  description = "A list of origin domains that will be allowed by CORS."
  default     = ["*"]
}

variable "allowed_headers" {
  type        = list(string)
  description = "A list of headers that are allowed to be a part of the cross-origin request."
  default     = ["*"]
}

variable "exposed_headers" {
  type        = list(string)
  description = "A list of response headers that are exposed to CORS clients."
  default     = ["*"]
}

variable "max_age_in_seconds" {
  type        = number
  description = "The number of seconds the client should cache a preflight response.  Defaults to 2 days"
  default     = 60 * 60 * 24 * 2
}

variable "tags" {
  description = "A map of tags to add to all resources"
  type        = map(string)
  default     = {}
}