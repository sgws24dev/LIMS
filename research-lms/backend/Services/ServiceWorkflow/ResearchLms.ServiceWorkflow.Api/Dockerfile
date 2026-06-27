FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5005

ENV ASPNETCORE_URLS=http://+:5005

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Services/ServiceWorkflow/ResearchLms.ServiceWorkflow.Api/ResearchLms.ServiceWorkflow.Api.csproj", "Services/ServiceWorkflow/ResearchLms.ServiceWorkflow.Api/"]
COPY ["Services/ServiceWorkflow/ResearchLms.ServiceWorkflow.Application/ResearchLms.ServiceWorkflow.Application.csproj", "Services/ServiceWorkflow/ResearchLms.ServiceWorkflow.Application/"]
COPY ["Services/ServiceWorkflow/ResearchLms.ServiceWorkflow.Domain/ResearchLms.ServiceWorkflow.Domain.csproj", "Services/ServiceWorkflow/ResearchLms.ServiceWorkflow.Domain/"]
COPY ["Services/ServiceWorkflow/ResearchLms.ServiceWorkflow.Infrastructure/ResearchLms.ServiceWorkflow.Infrastructure.csproj", "Services/ServiceWorkflow/ResearchLms.ServiceWorkflow.Infrastructure/"]
COPY ["BuildingBlocks/ResearchLms.Shared/ResearchLms.Shared.csproj", "BuildingBlocks/ResearchLms.Shared/"]
COPY ["BuildingBlocks/ResearchLms.Infrastructure/ResearchLms.Infrastructure.csproj", "BuildingBlocks/ResearchLms.Infrastructure/"]
RUN dotnet restore "Services/ServiceWorkflow/ResearchLms.ServiceWorkflow.Api/ResearchLms.ServiceWorkflow.Api.csproj"

COPY . .
WORKDIR "/src/Services/ServiceWorkflow/ResearchLms.ServiceWorkflow.Api"
RUN dotnet build "ResearchLms.ServiceWorkflow.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ResearchLms.ServiceWorkflow.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ResearchLms.ServiceWorkflow.Api.dll"]
