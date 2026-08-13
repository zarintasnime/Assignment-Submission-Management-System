using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using AssignmentManagement.Application.DTOs;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace AssignmentManagement.Tests;

public class ApiControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    private readonly WebApplicationFactory<Program> _factory;

    public ApiControllerIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                var dbName = $"IntegrationDb_{Guid.NewGuid()}";
                services.AddDbContext<AppDbContext>(options =>
                {
                    options.UseInMemoryDatabase(dbName);
                });
            });
        });
    }

    private async Task<(HttpClient client, User admin)> CreateAdminClientAsync()
    {
        var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var admin = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Admin Controller Test",
            Email = $"admin_{Guid.NewGuid()}@test.edu",
            PasswordHash = "hashed",
            Role = UserRole.Admin,
            IsActive = true
        };

        db.Users.Add(admin);
        await db.SaveChangesAsync();

        var jwtService = scope.ServiceProvider.GetRequiredService<AssignmentManagement.Application.Abstractions.IJwtTokenService>();
        var token = jwtService.Create(admin).Token;

        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        return (client, admin);
    }

    [Theory]
    [InlineData("/api/admin/teachers")]
    public async Task PostTeacher_CanonicalRoute_Returns201AndInsertsTeacher(string route)
    {
        var (client, _) = await CreateAdminClientAsync();
        var request = new CreateTeacherRequest("Prof. Test Teacher", $"teacher_{Guid.NewGuid()}@university.edu", "Password123!");

        var response = await client.PostAsJsonAsync(route, request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var teacher = await response.Content.ReadFromJsonAsync<TeacherResponse>(JsonOptions);
        Assert.NotNull(teacher);
        Assert.Equal("Prof. Test Teacher", teacher.FullName);
        Assert.Equal(UserRole.Teacher, teacher.Role);

        // Verify DB insertion
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var dbUser = await db.Users.SingleOrDefaultAsync(x => x.Id == teacher.Id);
        Assert.NotNull(dbUser);
        Assert.Equal(UserRole.Teacher, dbUser.Role);
        Assert.True(dbUser.IsActive);
    }

    [Theory]
    [InlineData("/api/admin/students")]
    public async Task PostStudent_CanonicalRoute_Returns201AndInsertsStudent(string route)
    {
        var (client, _) = await CreateAdminClientAsync();
        var request = new CreateStudentRequest("Student Tester", $"student_{Guid.NewGuid()}@school.edu", "StudentPass123!");

        var response = await client.PostAsJsonAsync(route, request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var student = await response.Content.ReadFromJsonAsync<StudentResponse>(JsonOptions);
        Assert.NotNull(student);
        Assert.Equal("Student Tester", student.FullName);
        Assert.Equal(UserRole.Student, student.Role);

        // Verify DB insertion
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var dbUser = await db.Users.SingleOrDefaultAsync(x => x.Id == student.Id);
        Assert.NotNull(dbUser);
        Assert.Equal(UserRole.Student, dbUser.Role);
    }

    [Theory]
    [InlineData("/api/admin/users")]
    public async Task PostUser_CanonicalRoute_Returns201AndInsertsUser(string route)
    {
        var (client, _) = await CreateAdminClientAsync();
        var request = new CreateUserRequest("Generic User", $"user_{Guid.NewGuid()}@domain.edu", "UserPass123!", UserRole.Teacher);

        var response = await client.PostAsJsonAsync(route, request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var user = await response.Content.ReadFromJsonAsync<UserResponse>(JsonOptions);
        Assert.NotNull(user);
        Assert.Equal("Generic User", user.FullName);
        Assert.Equal(UserRole.Teacher, user.Role);
    }
}
