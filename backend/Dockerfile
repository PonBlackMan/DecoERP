FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["src/DecoERP.Api/DecoERP.Api.csproj", "src/DecoERP.Api/"]
COPY ["src/DecoERP.Application/DecoERP.Application.csproj", "src/DecoERP.Application/"]
COPY ["src/DecoERP.Domain/DecoERP.Domain.csproj", "src/DecoERP.Domain/"]
COPY ["src/DecoERP.Infrastructure/DecoERP.Infrastructure.csproj", "src/DecoERP.Infrastructure/"]
RUN dotnet restore "src/DecoERP.Api/DecoERP.Api.csproj"

COPY . .
RUN dotnet publish "src/DecoERP.Api/DecoERP.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "DecoERP.Api.dll"]
