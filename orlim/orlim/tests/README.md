# Integration Tests với Jest

Thư mục này chứa các integration tests cho Orlim Limit Order Manager sử dụng Jest.

## 📋 Cấu trúc Tests

```
tests/
├── setup.ts                          # Jest setup file
├── integration/
│   ├── contractService.test.ts       # Tests cho ContractService
│   ├── deepbookService.test.ts       # Tests cho DeepBookService
│   ├── suiService.test.ts            # Tests cho SuiService
│   └── orderWorkflows.test.ts        # Tests cho complete order workflows
└── README.md                         # Tài liệu này
```

## 🚀 Chạy Tests

### Chạy tất cả tests
```bash
npm run test
```

### Chạy tests ở chế độ watch
```bash
npm run test:watch
```

### Chạy chỉ integration tests
```bash
npm run test:integration
```

### Chạy integration tests ở chế độ watch
```bash
npm run test:integration:watch
```

### Tạo coverage report
```bash
npm run test:coverage
```

## 📝 Test Files

### contractService.test.ts
Tests cho `ContractService` bao gồm:
- Tạo Order Manager transaction
- Place limit order transaction
- Place OCO order transaction
- Place TIF order transaction
- Cancel order transaction
- Batch cancel orders transaction
- Modify order transaction
- Cancel order by receipt transaction
- Create order receipt transaction

### deepbookService.test.ts
Tests cho `DeepBookService` bao gồm:
- Fetch order book từ DeepBook Indexer API
- Convert order book data format
- Sort bids/asks correctly
- Handle API errors
- Handle network errors
- Calculate mid price

### suiService.test.ts
Tests cho `SuiService` bao gồm:
- Get object by ID
- Get owned objects by address
- Filter objects by type
- Execute transactions
- Handle errors

### orderWorkflows.test.ts
Tests cho complete order workflows:
- Complete order lifecycle (create → modify → cancel)
- OCO order workflow
- TIF order workflow (IOC, FOK)
- Order receipt workflow
- Order book integration
- Multiple trading pairs
- Error handling

## 🔧 Cấu hình

Jest được cấu hình trong `jest.config.ts` với:
- TypeScript support với `ts-jest`
- ESM module support
- Path aliases (`@/`, `@components/`, etc.)
- Test timeout: 30 seconds (cho integration tests)
- Coverage reporting

## 📊 Coverage

Coverage reports được tạo trong thư mục `coverage/` sau khi chạy:
```bash
npm run test:coverage
```

## 🧪 Mocking

Tests sử dụng mocks cho:
- `fetch` API (cho DeepBook Indexer API calls)
- `@mysten/sui/client` (cho SuiClient)
- External dependencies

## 📌 Best Practices

1. **Isolation**: Mỗi test nên độc lập và không phụ thuộc vào test khác
2. **Cleanup**: Sử dụng `beforeEach` và `afterEach` để setup/cleanup
3. **Mocking**: Mock external dependencies (API calls, blockchain interactions)
4. **Assertions**: Sử dụng clear assertions để dễ debug
5. **Error Handling**: Test cả success cases và error cases

## 🐛 Debugging Tests

### Chạy một test file cụ thể
```bash
npm run test contractService.test.ts
```

### Chạy tests với verbose output
```bash
npm run test -- --verbose
```

### Chạy tests với không coverage
```bash
npm run test -- --no-coverage
```

## 📚 Tài liệu thêm

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [Sui TypeScript SDK](https://docs.sui.io/build/typescript-sdk)

