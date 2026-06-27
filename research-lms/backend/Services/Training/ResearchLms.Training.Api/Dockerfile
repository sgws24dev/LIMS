FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5013

ENV ASPNETCORE_URLS=http://+:5013

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Services/Training/ResearchLms.Training.Api/ResearchLms.Training.Api.csproj", "Services/Training/ResearchLms.Training.Api/"]
COPY ["Services/Training/ResearchLms.Training.Application/ResearchLms.Training.Application.csproj", "Services/Training/ResearchLms.Training.Application/"]
COPY ["Services/Training/ResearchLms.Training.Domain/ResearchLms.Training.Domain.csproj", "Services/Training/ResearchLms.Training.Domain/"]
COPY ["Services/Training/ResearchLms.Training.Infrastructure/ResearchLms.Training.Infrastructure.csproj", "Services/Training/ResearchLms.Training.Infrastructure/"]
COPY ["BuildingBlocks/ResearchLms.Shared/ResearchLms.Shared.csproj", "BuildingBlocks/ResearchLms.Shared/"]
COPY ["BuildingBlocks/ResearchLms.Infrastructure/ResearchLms.Infrastructure.csproj", "BuildingBlocks/ResearchLms.Infrastructure/"]
RUN dotnet restore "Services/Training/ResearchLms.Training.Api/ResearchLms.Training.Api.csproj"
COPY . .
WORKDIR "/src/Services/Training/ResearchLms.Training.Api"
RUN dotnet build "ResearchLms.Training.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ResearchLms.Training.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ResearchLms.Training.Api.dll"]
