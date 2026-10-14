locals {
    routingKeyCritical = "vo-bapp002245-fuel-orchestration-critical"
    routingKey         = "vo-fuel"
    appname            = var.environment == "nonprod" ? "ftrfuel-cart-nonprod" : "ftrfuel-cart-prod"
    logWorkspace       = "/subscriptions/c43fb76d-ea4c-45b8-9135-8342260ad6fe/resourcegroups/mg-mgmt/providers/microsoft.operationalinsights/workspaces/mg-la-c43fb76d-ea4c-45b8-9135-8342260ad6fe"
}

// Send alert to the vo-fuel-critical routing key in Splunk
resource "azurerm_monitor_action_group" "splunk-critical" {
  name                = "ftrfuel-cart-splunk-${var.environment}"
  resource_group_name = module.ftrfuel-cart.resource_group_name
  short_name          = "ftrsplk${var.environment}"

#  webhook_receiver {
#    name        = "splunk-${var.environment}"
#    service_uri = "https://alert-mapping.victorops.com/integrations/azure/v1/cbe76567-dc45-49e4-9a4a-6f534e2f8ceb/${local.routingKey}"
#  }

  email_receiver {
    name          = "Frontier Developers"
    email_address = "ftr-cart-support@ftr.com"
  }
}

resource "azurerm_monitor_scheduled_query_rules_alert" "container-crash" {
  name                = "ftrfuel-cart-${var.environment}-container-crash"
  location            = module.ftrfuel-cart.resource_group_location
  resource_group_name = module.ftrfuel-cart.resource_group_name

  action {
    action_group      = [azurerm_monitor_action_group.splunk-critical.id]
  }

  data_source_id = local.logWorkspace
  description    = "Alert when a container crash is logged."
  enabled        = true
  severity       = 2 

  query          = <<-QUERY
  AppServicePlatformLogs
    | where TimeGenerated > ago(5min)
    | where Level == "Error" and _ResourceId contains "${local.appname}"
    | summarize Crashes = count() by _ResourceId
  QUERY
  
  frequency   = 5
  time_window = 30
  trigger {
    operator  = "GreaterThan"
    threshold = 0
  }
}

/* resource "azurerm_monitor_metric_alert" "memory-usage" {
  depends_on = [
    azurerm_monitor_action_group.splunk-critical
  ]
  name                = "ftrfuel-cart-${var.environment}-memory-usage"
  resource_group_name = module.ftrfuel-cart.resource_group_name
  scopes              = [module.ftrfuel-cart.app_insights_id]
  description         = "Alert when memory usage exceeds 85%."
  severity            = 2 

  criteria {
    metric_namespace = "Microsoft.Web/serverfarms"
    metric_name      = "MemoryPercentage"
    aggregation      = "Total"
    operator         = "GreaterThanOrEqual"
    threshold        = 85
  }

  action {
    action_group_id = azurerm_monitor_action_group.splunk-critical.id
  }
} */

resource "azurerm_monitor_metric_alert" "cpu-usage" {
  depends_on = [
    azurerm_monitor_action_group.splunk-critical
  ]
  name                = "ftrfuel-cart-${var.environment}-cpu-usage"
  resource_group_name = module.ftrfuel-cart.resource_group_name
  scopes              = [module.ftrfuel-cart.app_service_plan_id]
  description         = "Alert when CPU usage exceeds 70%."
  severity            = 2 

  criteria {
    metric_namespace = "Microsoft.Web/serverfarms"
    metric_name      = "CpuPercentage"
    aggregation      = "Average"
    operator         = "GreaterThanOrEqual"
    threshold        = 70
  }

  action {
    action_group_id = azurerm_monitor_action_group.splunk-critical.id
  }
}