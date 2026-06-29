namespace DecoERP.Application.Common.Models;

public record Result<T>(bool IsSuccess, T? Data, string? Error)
{
    public static Result<T> Success(T data) => new(true, data, null);
    public static Result<T> Failure(string error) => new(false, default, error);
}

public record PagedResult<T>(IEnumerable<T> Items, int TotalCount, int Page, int PageSize);
