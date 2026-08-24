<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::with('role')->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        $token = method_exists($user, 'createToken') ? $user->createToken('stockpilot_token')->plainTextToken : bin2hex(random_bytes(32));

      
        AuditLog::create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_role' => $user->role?->name ?? 'user',
            'action' => 'USER_LOGIN',
            'category' => 'auth',
            'description' => "User {$user->name} logged into the system.",
            'exact_timestamp' => now(),
        ]);

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user()?->load('role') ?? User::with('role')->first());
    }

    public function updateProfile(Request $request)
    {
        $user = User::first();
        if ($request->user()) {
            $user = $request->user();
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string',
            'new_password' => 'nullable|string|min:6',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        if (!empty($validated['phone'])) {
            $user->phone = $validated['phone'];
        }

        if (!empty($validated['new_password'])) {
            $user->password = Hash::make($validated['new_password']);
        }

        $user->save();

        AuditLog::create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_role' => $user->role?->name ?? 'admin',
            'action' => 'PROFILE_UPDATED',
            'category' => 'auth',
            'description' => "User {$user->name} updated their profile/credentials (Email: {$user->email}).",
            'exact_timestamp' => now(),
        ]);

        return response()->json([
            'user' => $user->fresh()->load('role'),
            'message' => 'Profile and credentials updated successfully!'
        ]);
    }

    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()?->delete();
        }

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function listStaff()
    {
        return response()->json(User::with('role')->get());
    }

    public function createStaff(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role_id' => 'required|exists:roles,id',
            'phone' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
            'phone' => $validated['phone'] ?? null,
        ]);

        $adminName = $request->user()?->name ?? 'Admin';

        AuditLog::create([
            'user_id' => $request->user()?->id,
            'user_name' => $adminName,
            'user_role' => 'admin',
            'action' => 'USER_CREATED',
            'category' => 'auth',
            'description' => "Created new staff user {$user->name} ({$user->email}).",
            'exact_timestamp' => now(),
        ]);

        return response()->json([
            'message' => 'Staff account created successfully!',
            'user' => $user->load('role'),
        ], 201);
    }

    public function switchUser(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $targetUser = User::with('role')->findOrFail($validated['user_id']);
        $token = method_exists($targetUser, 'createToken') ? $targetUser->createToken('stockpilot_token')->plainTextToken : bin2hex(random_bytes(32));

        AuditLog::create([
            'user_id' => $request->user()?->id,
            'user_name' => $request->user()?->name ?? 'Admin',
            'user_role' => $request->user()?->role?->name ?? 'admin',
            'action' => 'USER_SWITCHED',
            'category' => 'auth',
            'description' => "Switched active user session context to {$targetUser->name} ({$targetUser->email}).",
            'exact_timestamp' => now(),
        ]);

        return response()->json([
            'message' => "Switched session to {$targetUser->name}.",
            'user' => $targetUser,
            'token' => $token,
        ]);
    }
}
