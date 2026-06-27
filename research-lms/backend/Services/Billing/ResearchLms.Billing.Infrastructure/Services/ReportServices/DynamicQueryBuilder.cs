using System.Dynamic;
using System.Linq.Dynamic.Core;
using ResearchLms.Billing.Domain.Entities;
using ResearchLms.Billing.Domain.Enums;
using ResearchLms.Billing.Domain.ValueObjects;

namespace ResearchLms.Billing.Infrastructure.Services.ReportServices;

public class DynamicQueryBuilder
{
    public IQueryable<ExpandoObject> BuildQuery(IQueryable querySource, ReportDefinition definition)
    {
        var fields = definition.GetFields();
        var filters = definition.GetFilters();

        var query = querySource;

        query = ApplyFilters(query, filters);
        query = ApplyProjection(query, fields);

        return (IQueryable<ExpandoObject>)query;
    }

    private static IQueryable ApplyFilters(IQueryable query, List<ReportFilter> filters)
    {
        foreach (var filter in filters)
        {
            var expression = filter.Operator switch
            {
                FilterOperator.Equals => $"{filter.FieldName} == \"{EscapeString(filter.Value)}\"",
                FilterOperator.NotEquals => $"{filter.FieldName} != \"{EscapeString(filter.Value)}\"",
                FilterOperator.GreaterThan => $"{filter.FieldName} > {filter.Value}",
                FilterOperator.LessThan => $"{filter.FieldName} < {filter.Value}",
                FilterOperator.GreaterThanOrEqual => $"{filter.FieldName} >= {filter.Value}",
                FilterOperator.LessThanOrEqual => $"{filter.FieldName} <= {filter.Value}",
                FilterOperator.Contains => $"{filter.FieldName}.Contains(\"{EscapeString(filter.Value)}\")",
                FilterOperator.StartsWith => $"{filter.FieldName}.StartsWith(\"{EscapeString(filter.Value)}\")",
                FilterOperator.EndsWith => $"{filter.FieldName}.EndsWith(\"{EscapeString(filter.Value)}\")",
                FilterOperator.Between when filter.SecondValue != null =>
                    $"{filter.FieldName} >= {filter.Value} && {filter.FieldName} <= {filter.SecondValue}",
                FilterOperator.In => BuildInExpression(filter),
                _ => throw new InvalidOperationException($"Unsupported filter operator: {filter.Operator}"),
            };

            query = query.Where(expression);
        }

        return query;
    }

    private static IQueryable ApplyProjection(IQueryable query, List<ReportField> fields)
    {
        if (fields.Count == 0)
            return query;

        var selectParts = fields.Select(f =>
        {
            var fieldExpr = $"{f.SourceEntity}.{f.FieldName} as {f.DisplayName}";
            return f.Aggregation switch
            {
                AggregationType.Sum => $"Sum({fieldExpr})",
                AggregationType.Average => $"Average({fieldExpr})",
                AggregationType.Count => $"Count() as {f.DisplayName}",
                AggregationType.Min => $"Min({fieldExpr})",
                AggregationType.Max => $"Max({fieldExpr})",
                _ => fieldExpr,
            };
        });

        return query.Select(string.Join(", ", selectParts));
    }

    private static string BuildInExpression(ReportFilter filter)
    {
        var values = filter.Value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var quoted = values.Select(v => $"\"{EscapeString(v)}\"");
        return $"{filter.FieldName} in ({string.Join(", ", quoted)})";
    }

    private static string EscapeString(string value)
    {
        return value.Replace("\\", "\\\\").Replace("\"", "\\\"");
    }
}
