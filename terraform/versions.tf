terraform {
  cloud {
    organization = "frontier-devops"
    workspaces {}
  }
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 3.0"
    }
  }
  required_version = "~> 1.0"
}

provider "azurerm" {
  features {}
  skip_provider_registration  = true
}

data "azurerm_client_config" "current" {}