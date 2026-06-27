FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5008

ENV ASPNETCORE_URLS=http://+:5008

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Services/Billing/ResearchLms.Billing.Api/ResearchLms.Billing.Api.csproj", "Services/Billing/ResearchLms.Billing.Api/"]
COPY ["Services/Billing/ResearchLms.Billing.Application/ResearchLms.Billing.Application.csproj", "Services/Billing/ResearchLms.Billing.Application/"]
COPY ["Services/Billing/ResearchLms.Billing.Domain/ResearchLms.Billing.Domain.csproj", "Services/Billing/ResearchLms.Billing.Domain/"]
COPY ["Services/Billing/ResearchLms.Billing.Infrastructure/ResearchLms.Billing.Infrastructure.csproj", "Services/Billing/ResearchLms.Billing.Infrastructure/"]
COPY ["BuildingBlocks/ResearchLms.Shared/ResearchLms.Shared.csproj", "BuildingBlocks/ResearchLms.Shared/"]
COPY ["BuildingBlocks/ResearchLms.Infrastructure/ResearchLms.Infrastructure.csproj", "BuildingBlocks/ResearchLms.Infrastructure/"]
RUN dotnet restore "Services/Billing/ResearchLms.Billing.Api/ResearchLms.Billing.Api.csproj"

COPY . .
WORKDIR "/src/Services/Billing/ResearchLms.Billing.Api"
RUN dotnet build "ResearchLms.Billing.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ResearchLms.Billing.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ResearchLms.Billing.Api.dll"]
