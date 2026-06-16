using ResearchLms.Facilities.Application.DTOs;
using ResearchLms.Shared.Domain.Entities;
using ResearchLms.Shared.Domain.Enums;

namespace ResearchLms.Facilities.Application.Mappings;

public static class AssetMapping
{
    public static AssetDto ToDto(Asset asset)
    {
        return new AssetDto(
            asset.Id,
            asset.Name,
            asset.Identifier,
            asset.Category,
            asset.AssetType,
            asset.Status.ToString(),
            asset.FacilityId,
            asset.Facility?.Name,
            asset.Location,
            asset.CurrentValue,
            asset.QrCode);
    }

    public static AssetDetailDto ToDetailDto(Asset asset)
    {
        var instrument = asset as Instrument;

        return new AssetDetailDto(
            asset.Id,
            asset.TenantId,
            asset.Name,
            asset.Identifier,
            asset.Category,
            asset.AssetType,
            asset.Status.ToString(),
            asset.FacilityId,
            asset.Facility?.Name,
            asset.Model,
            asset.Manufacturer,
            asset.AcquisitionDate,
            asset.AcquisitionCost,
            asset.CurrentValue,
            asset.SalvageValue,
            asset.UsefulLifeYears,
            asset.DepreciationMethod?.ToString(),
            asset.Location,
            asset.CustomFields,
            asset.QrCode,
            asset.RfidTag,
            asset.CreatedAt,
            asset.UpdatedAt,
            instrument?.IpAddress,
            instrument?.Port,
            instrument?.ConnectionProtocol?.ToString(),
            instrument?.Firmware,
            instrument?.LastCalibrationDate,
            instrument?.NextCalibrationDate,
            instrument?.MaintenanceIntervalDays,
            instrument?.IotEnabled ?? false);
    }

    public static Asset ToEntity(CreateAssetRequest dto, string assetType)
    {
        DepreciationMethod? depMethod = dto.DepreciationMethod is not null
            ? Enum.Parse<DepreciationMethod>(dto.DepreciationMethod)
            : null;

        if (assetType == "Instrument")
        {
            ConnectionProtocol? protocol = dto.ConnectionProtocol is not null
                ? Enum.Parse<ConnectionProtocol>(dto.ConnectionProtocol)
                : null;

            return new Instrument(
                dto.Name, dto.Identifier, dto.Category,
                dto.FacilityId, dto.Model, dto.Manufacturer,
                dto.AcquisitionDate, dto.AcquisitionCost,
                dto.SalvageValue, dto.UsefulLifeYears,
                depMethod, dto.Location, dto.CustomFields,
                dto.QrCode, dto.RfidTag,
                dto.IpAddress, dto.Port, protocol,
                dto.Firmware, dto.LastCalibrationDate, dto.NextCalibrationDate,
                dto.MaintenanceIntervalDays, dto.IotEnabled);
        }

        return new Asset(
            dto.Name, dto.Identifier, dto.Category, assetType,
            dto.FacilityId, dto.Model, dto.Manufacturer,
            dto.AcquisitionDate, dto.AcquisitionCost,
            dto.SalvageValue, dto.UsefulLifeYears,
            depMethod, dto.Location, dto.CustomFields,
            dto.QrCode, dto.RfidTag);
    }

    public static void ApplyUpdate(Asset asset, UpdateAssetRequest dto)
    {
        DepreciationMethod? depMethod = dto.DepreciationMethod is not null
            ? Enum.Parse<DepreciationMethod>(dto.DepreciationMethod)
            : null;

        asset.Update(dto.Name, asset.Category,
            dto.Model, dto.Manufacturer,
            dto.AcquisitionDate, dto.AcquisitionCost, dto.SalvageValue,
            dto.UsefulLifeYears, depMethod, dto.Location,
            dto.CustomFields, dto.QrCode, dto.RfidTag);

        if (asset is Instrument instrument)
        {
            ConnectionProtocol? protocol = dto.ConnectionProtocol is not null
                ? Enum.Parse<ConnectionProtocol>(dto.ConnectionProtocol)
                : null;

            instrument.UpdateInstrument(
                dto.IpAddress, dto.Port, protocol,
                dto.Firmware, dto.LastCalibrationDate, dto.NextCalibrationDate,
                dto.MaintenanceIntervalDays, dto.IotEnabled);
        }
    }
}
