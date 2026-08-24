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
}
